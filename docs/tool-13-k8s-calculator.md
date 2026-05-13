# Kubernetes Resource Calculator

A professional utility for DevOps engineers to calculate container resources, estimate pod scheduling, and generate Kubernetes manifests with best-practice resource specifications.

## Features
- **Multi-Container Pod Support**: Add and configure multiple containers (main app, sidecars, proxies) in a single pod.
- **Resource Presets**: Quick-start with common resource profiles (Sidecar, API Server, Database, etc.).
- **Automatic QoS Classification**: Real-time detection of Pod Quality of Service (Guaranteed, Burstable, BestEffort).
- **Cluster Capacity Estimation**: Calculate how many pods fit per node and minimum nodes required for replicas.
- **Node Utilization Visuals**: See how much of a node's CPU/Memory is consumed by a single pod.
- **Best-Practice Validation**: In-line warnings for common mistakes (missing limits, high burst ratios, etc.).
- **YAML Generation**: Export a production-ready `Deployment` manifest with all resource settings.

## Rules & Logic
- **CPU**: Supports both `m` (millicores) and `cores`.
- **Memory**: Supports `Mi` (Mebibytes) and `Gi` (Gibibytes).
- **QoS Logic**:
  - `Guaranteed`: All containers have CPU/Memory requests EQUAL to limits.
  - `Burstable`: At least one container has a request or limit set, but they are not all equal.
  - `BestEffort`: No containers have any requests or limits defined.

## Technical Implementation
- **100% Client-Side**: All calculations and YAML generation happen in the browser.
- **Responsive Layout**: Two-column desktop view that collapses to a single column for smaller screens.
- **Downloadable YAML**: One-click download of the generated configuration.
