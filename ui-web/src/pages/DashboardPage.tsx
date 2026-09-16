import { useMemo, useState } from "react";
import { useThunderID } from "@thunderid/react";
import {
  getThunderIDUser,
  getUserDisplayName,
  getUserEmail,
  type ThunderIDHookState
} from "../auth/thunderid";
import AccessRequestForm from "../components/AccessRequestForm";
import AccessRequestTable from "../components/AccessRequestTable";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import FilterBar, { type DashboardFilters } from "../components/FilterBar";
import Header from "../components/Header";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import StatCard from "../components/StatCard";
import { ALL_FILTER_VALUE } from "../constants/accessRequest.constants";
import {
  useAccessRequests,
  useCreateAccessRequest,
  useDeleteAccessRequest,
  useUpdateAccessRequest
} from "../queries/accessRequests.queries";
import type {
  AccessRequest,
  AccessRequestFilters,
  AccessRequestFormValues,
  UpdateAccessRequestPayload
} from "../types/accessRequest.types";
import { getErrorMessage } from "../utils/getErrorMessage";

const defaultFilters: DashboardFilters = {
  search: "",
  status: ALL_FILTER_VALUE,
  priority: ALL_FILTER_VALUE,
  application: ALL_FILTER_VALUE
};

export default function DashboardPage(): JSX.Element {
  const auth = useThunderID() as ThunderIDHookState;
  const signedInUser = getThunderIDUser(auth.user);
  const requesterNamePrefill = getUserDisplayName(signedInUser);
  const requesterEmailPrefill = getUserEmail(signedInUser) ?? "";

  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | undefined>(undefined);
  const [activeDeleteId, setActiveDeleteId] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const queryFilters: AccessRequestFilters = useMemo(
    () => ({
      search: filters.search.trim() || undefined,
      status: filters.status === ALL_FILTER_VALUE ? undefined : filters.status,
      priority: filters.priority === ALL_FILTER_VALUE ? undefined : filters.priority,
      application: filters.application === ALL_FILTER_VALUE ? undefined : filters.application
    }),
    [filters]
  );

  const requestsQuery = useAccessRequests(queryFilters);
  const createMutation = useCreateAccessRequest();
  const updateMutation = useUpdateAccessRequest();
  const deleteMutation = useDeleteAccessRequest();

  const requests = requestsQuery.data ?? [];

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((item) => item.status === "pending").length;
    const inReview = requests.filter((item) => item.status === "in_review").length;
    const approved = requests.filter((item) => item.status === "approved").length;
    const rejected = requests.filter((item) => item.status === "rejected").length;
    return { total, pending, inReview, approved, rejected };
  }, [requests]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function openCreateForm(): void {
    setSubmitError(null);
    setSelectedRequest(undefined);
    setFormMode("create");
    setIsFormOpen(true);
  }

  function openEditForm(request: AccessRequest): void {
    setSubmitError(null);
    setSelectedRequest(request);
    setFormMode("edit");
    setIsFormOpen(true);
  }

  function closeForm(): void {
    setIsFormOpen(false);
    setSubmitError(null);
  }

  async function handleFormSubmit(values: AccessRequestFormValues): Promise<void> {
    setSubmitError(null);

    try {
      if (formMode === "create") {
        await createMutation.mutateAsync({
          requesterName: values.requesterName,
          requesterEmail: values.requesterEmail,
          applicationName: values.applicationName,
          accessLevel: values.accessLevel,
          businessJustification: values.businessJustification,
          priority: values.priority,
          notes: values.notes || undefined
        });
      } else if (selectedRequest) {
        const payload: UpdateAccessRequestPayload = {
          requesterName: values.requesterName,
          requesterEmail: values.requesterEmail,
          applicationName: values.applicationName,
          accessLevel: values.accessLevel,
          businessJustification: values.businessJustification,
          priority: values.priority,
          status: values.status,
          notes: values.notes
        };

        await updateMutation.mutateAsync({
          id: selectedRequest.id,
          payload
        });
      }

      closeForm();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Failed to save access request"));
    }
  }

  async function handleDelete(request: AccessRequest): Promise<void> {
    setActiveDeleteId(request.id);
    try {
      await deleteMutation.mutateAsync(request.id);
    } catch {
      // Keep UI minimal in this phase; query error display remains available.
    } finally {
      setActiveDeleteId(undefined);
    }
  }

  return (
    <Layout header={<Header onCreateRequest={openCreateForm} />}>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Requests" value={stats.total} tone="slate" />
        <StatCard title="Pending" value={stats.pending} tone="amber" />
        <StatCard title="In Review" value={stats.inReview} tone="sky" />
        <StatCard title="Approved" value={stats.approved} tone="emerald" />
        <StatCard title="Rejected" value={stats.rejected} tone="rose" />
      </section>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      {requestsQuery.isLoading ? <LoadingState /> : null}

      {requestsQuery.isError ? (
        <ErrorState
          message={getErrorMessage(requestsQuery.error, "Failed to fetch access requests")}
          onRetry={() => requestsQuery.refetch()}
        />
      ) : null}

      {!requestsQuery.isLoading && !requestsQuery.isError && requests.length === 0 ? (
        <EmptyState onCreateRequest={openCreateForm} />
      ) : null}

      {!requestsQuery.isLoading && !requestsQuery.isError && requests.length > 0 ? (
        <AccessRequestTable
          requests={requests}
          onEdit={openEditForm}
          onDelete={handleDelete}
          busyRequestId={activeDeleteId}
        />
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            Signed-in user (debug)
          </summary>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
            {JSON.stringify(auth.user ?? null, null, 2)}
          </pre>
        </details>
      </section>

      <AccessRequestForm
        isOpen={isFormOpen}
        mode={formMode}
        initialData={selectedRequest}
        defaultRequesterName={requesterNamePrefill}
        defaultRequesterEmail={requesterEmailPrefill}
        lockRequesterEmail
        isSubmitting={isSubmitting}
        submitError={submitError}
        onClose={closeForm}
        onSubmit={(values) => {
          void handleFormSubmit(values);
        }}
      />
    </Layout>
  );
}
