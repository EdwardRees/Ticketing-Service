<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	function fmt(d: Date | string): string {
		return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	const TYPE_LABELS: Record<string, string> = {
		mobile: 'Mobile', web: 'Web', system_design: 'System Design',
		tutoring: 'Tutoring', other: 'Other'
	};

	const STATUS_LABELS: Record<string, string> = {
		open: 'Open', in_progress: 'In Progress',
		resolved: 'Resolved', closed: 'Closed'
	};
</script>

<div class="page">
	<div class="page-header">
		<div>
			<h1>Dashboard</h1>
			<p class="page-sub">Overview of your ticketing queue</p>
		</div>
		<a href="/tickets/new" class="btn-primary">
			<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
				<path d="M6.5 2v9M2 6.5h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
			</svg>
			New Ticket
		</a>
	</div>

	<div class="stats-row">
		<div class="stat-card">
			<span class="stat-num open">{data.stats.open}</span>
			<span class="stat-label">Open</span>
		</div>
		<div class="stat-card">
			<span class="stat-num progress">{data.stats.inProgress}</span>
			<span class="stat-label">In Progress</span>
		</div>
		<div class="stat-card">
			<span class="stat-num resolved">{data.stats.resolved}</span>
			<span class="stat-label">Resolved</span>
		</div>
		<div class="stat-card">
			<span class="stat-num closed">{data.stats.closed}</span>
			<span class="stat-label">Closed</span>
		</div>
	</div>

	<div class="section">
		<div class="section-head">
			<h2>Recent Tickets</h2>
			<a href="/tickets" class="link-more">View all →</a>
		</div>

		{#if data.recent.length === 0}
			<div class="empty-state">
				<p>No tickets yet.</p>
				<a href="/tickets/new" class="btn-primary" style="display:inline-flex;margin-top:12px">Create your first ticket</a>
			</div>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Title</th>
							<th>Contact</th>
							<th>Type</th>
							<th>Status</th>
							<th>Created</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recent as ticket}
							<tr class="row-link" onclick={() => goto(`/tickets/${ticket.id}`)}>
								<td class="td-title">{ticket.title}</td>
								<td class="td-muted">{ticket.contactName}</td>
								<td><span class="badge badge-type">{TYPE_LABELS[ticket.type] ?? ticket.type}</span></td>
								<td><span class="badge badge-{ticket.status}">{STATUS_LABELS[ticket.status] ?? ticket.status}</span></td>
								<td class="td-muted">{fmt(ticket.createdAt)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<style>
	.page {
		padding: 32px 36px;
		max-width: 1000px;
	}
	.page-header {
		display: flex; align-items: flex-start; justify-content: space-between;
		margin-bottom: 28px;
	}
	h1 {
		font-size: 22px; font-weight: 600;
		color: #1a1b23; margin: 0 0 4px;
		letter-spacing: -0.025em;
	}
	.page-sub { font-size: 13.5px; color: #6b7280; margin: 0; }

	.btn-primary {
		display: inline-flex; align-items: center; gap: 6px;
		background: #6366f1; color: white;
		padding: 8px 14px;
		border-radius: 8px;
		font-size: 13.5px; font-weight: 500;
		text-decoration: none;
		transition: background 0.13s;
		white-space: nowrap;
	}
	.btn-primary:hover { background: #4f46e5; }

	.stats-row {
		display: grid; grid-template-columns: repeat(4, 1fr);
		gap: 14px; margin-bottom: 32px;
	}
	.stat-card {
		background: white;
		border: 1px solid #e5e3df;
		border-radius: 10px;
		padding: 20px 18px;
		display: flex; flex-direction: column; gap: 4px;
	}
	.stat-num {
		font-size: 30px; font-weight: 600;
		letter-spacing: -0.04em; line-height: 1;
	}
	.stat-num.open { color: #2563eb; }
	.stat-num.progress { color: #d97706; }
	.stat-num.resolved { color: #059669; }
	.stat-num.closed { color: #6b7280; }
	.stat-label { font-size: 12.5px; color: #9ca3af; font-weight: 400; }

	.section { margin-top: 8px; }
	.section-head {
		display: flex; align-items: center; justify-content: space-between;
		margin-bottom: 12px;
	}
	h2 { font-size: 15px; font-weight: 600; color: #1a1b23; margin: 0; letter-spacing: -0.015em; }
	.link-more { font-size: 13px; color: #6366f1; text-decoration: none; }
	.link-more:hover { text-decoration: underline; }

	.table-wrap {
		background: white;
		border: 1px solid #e5e3df;
		border-radius: 10px;
		overflow: hidden;
	}
	table { width: 100%; border-collapse: collapse; }
	thead tr { border-bottom: 1px solid #f0eeea; }
	th {
		text-align: left;
		padding: 11px 16px;
		font-size: 12px; font-weight: 500;
		color: #9ca3af;
		text-transform: uppercase; letter-spacing: 0.04em;
	}
	td { padding: 12px 16px; border-bottom: 1px solid #f7f6f3; }
	tbody tr:last-child td { border-bottom: none; }

	.row-link { cursor: pointer; transition: background 0.1s; }
	.row-link:hover td { background: #fafaf8; }

	.td-title { font-size: 13.5px; font-weight: 500; color: #1a1b23; }
	.td-muted { font-size: 13px; color: #6b7280; }

	.badge {
		display: inline-flex; align-items: center;
		padding: 3px 9px;
		border-radius: 20px;
		font-size: 12px; font-weight: 500;
		white-space: nowrap;
	}
	.badge-type { background: #f4f3ff; color: #6366f1; }
	.badge-open { background: #eff6ff; color: #2563eb; }
	.badge-in_progress { background: #fffbeb; color: #d97706; }
	.badge-resolved { background: #ecfdf5; color: #059669; }
	.badge-closed { background: #f9fafb; color: #6b7280; }

	.empty-state {
		background: white; border: 1px solid #e5e3df;
		border-radius: 10px; padding: 40px;
		text-align: center; color: #9ca3af;
		font-size: 13.5px;
	}
	.empty-state p { margin: 0; }
</style>
