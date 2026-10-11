# Deploying the Zerpy landing page to Cloud Run

Static site served by nginx from a single Cloud Run service (`homepage`),
scale-to-zero, fronted by Cloud Run's built-in domain mapping for
`zerpy.dev` and `www.zerpy.dev` (free managed HTTPS, no load balancer). It
lives in the `raidschedule` GCP project, region `us-central1`, alongside the
RaidSchedule service, and shares its Artifact Registry repo and its GitHub
Workload Identity pool.

## Automated deploys

`.github/workflows/deploy.yml` runs on every push to `main`: typecheck and
tests gate the deploy, then it builds the image tagged with the commit SHA,
pushes it to Artifact Registry, and runs `gcloud run deploy` with just the
new image. Every other setting (service account, scaling limits, memory) is
preserved from the service's existing configuration.

Auth is via Workload Identity Federation, not a stored key. GitHub's OIDC
token is exchanged for short-lived access as `homepage-deployer`, which is
scoped so this repo can't touch RaidSchedule:

- `roles/artifactregistry.writer` on the `raidschedule` Artifact Registry repo
- `roles/iam.serviceAccountUser` on the runtime account `homepage-run` only
- `roles/run.admin` on the `homepage` service only
- `roles/iam.workloadIdentityUser` for the `CoryTapply/Homepage` repo only

The runtime account `homepage-run` has no roles at all: the page is static.

## One-time setup

These are the commands the live setup was created with. `P=raidschedule`,
`R=us-central1`, `D=homepage-deployer@$P.iam.gserviceaccount.com`.

```sh
gcloud iam service-accounts create homepage-run --display-name="Homepage Cloud Run service account" --project=$P
gcloud iam service-accounts create homepage-deployer --display-name="Homepage GitHub Actions deployer" --project=$P

# Create the service once with a placeholder image; the workflow only swaps the image.
gcloud run deploy homepage \
  --image=us-docker.pkg.dev/cloudrun/container/hello \
  --region=$R --project=$P \
  --service-account=homepage-run@$P.iam.gserviceaccount.com \
  --min-instances=0 --max-instances=2 --memory=128Mi --port=8080 \
  --allow-unauthenticated

gcloud artifacts repositories add-iam-policy-binding raidschedule --location=$R --project=$P \
  --member="serviceAccount:$D" --role=roles/artifactregistry.writer
gcloud iam service-accounts add-iam-policy-binding homepage-run@$P.iam.gserviceaccount.com --project=$P \
  --member="serviceAccount:$D" --role=roles/iam.serviceAccountUser
gcloud run services add-iam-policy-binding homepage --region=$R --project=$P \
  --member="serviceAccount:$D" --role=roles/run.admin
gcloud iam service-accounts add-iam-policy-binding $D --project=$P \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/538937472443/locations/global/workloadIdentityPools/github-pool/attribute.repository/CoryTapply/Homepage"

# The provider is shared with RaidSchedule; its condition lists every repo allowed to use it.
gcloud iam workload-identity-pools providers update-oidc github-provider \
  --location=global --workload-identity-pool=github-pool --project=$P \
  --attribute-condition="assertion.repository in ['CoryTapply/RaidSchedule', 'CoryTapply/Homepage']"
```

## Domain mapping

```sh
gcloud beta run domain-mappings create --service=homepage --domain=zerpy.dev --region=$R --project=$P
gcloud beta run domain-mappings create --service=homepage --domain=www.zerpy.dev --region=$R --project=$P
```

DNS records at the zerpy.dev DNS host:

| Name | Type | Value |
| --- | --- | --- |
| `@` | A | `216.239.32.21`, `216.239.34.21`, `216.239.36.21`, `216.239.38.21` |
| `@` | AAAA | `2001:4860:4802:32::15`, `2001:4860:4802:34::15`, `2001:4860:4802:36::15`, `2001:4860:4802:38::15` |
| `www` | CNAME | `ghs.googlehosted.com.` |

`www.zerpy.dev` is redirected to `https://zerpy.dev` by `nginx.conf`.

Check certificate status with:

```sh
gcloud beta run domain-mappings describe --domain=zerpy.dev --region=$R --project=$P --format="yaml(status.conditions)"
```

## Manual deploy

Build for `linux/amd64` (Cloud Run doesn't run arm64 images) and always use
a new tag:

```sh
docker buildx build --platform linux/amd64 -t $R-docker.pkg.dev/$P/raidschedule/homepage:<TAG> --push .
gcloud run deploy homepage --image=$R-docker.pkg.dev/$P/raidschedule/homepage:<TAG> --region=$R --project=$P
```
