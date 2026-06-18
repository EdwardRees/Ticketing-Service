<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';

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

	// ── Kanban board ──────────────────────────────────────────────────────────

	type Status = 'open' | 'in_progress' | 'resolved' | 'closed';
	type Ticket = PageData['byStatus']['open'][number];

	const STATUSES: Status[] = ['open', 'in_progress', 'resolved', 'closed'];

	// Snapshot initial data (updates handled in $effect below)
	const _initial = data.byStatus;
	let board = $state({
		open: [..._initial.open],
		in_progress: [..._initial.in_progress],
		resolved: [..._initial.resolved],
		closed: [..._initial.closed]
	});

	// Re-sync board from server data (e.g. after invalidateAll)
	$effect(() => {
		board.open = [...data.byStatus.open];
		board.in_progress = [...data.byStatus.in_progress];
		board.resolved = [...data.byStatus.resolved];
		board.closed = [...data.byStatus.closed];
	});

	let dragging = $state<{ ticket: Ticket; fromStatus: Status } | null>(null);
	let dragOverStatus = $state<Status | null>(null);

	// Track recently-dragged ticket IDs to suppress the trailing onclick after a drag
	const recentlyDragged = new Set<string>();

	function handleDragStart(e: DragEvent, ticket: Ticket, fromStatus: Status) {
		dragging = { ticket, fromStatus };
		e.dataTransfer!.effectAllowed = 'move';
		e.dataTransfer!.setData('text/plain', ticket.id);
	}

	function handleDragEnd() {
		dragging = null;
		dragOverStatus = null;
	}

	function handleDragOver(e: DragEvent, status: Status) {
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
		dragOverStatus = status;
	}

	function handleDragLeave(e: DragEvent) {
		const related = e.relatedTarget as Element | null;
		if (related && (e.currentTarget as Element).contains(related)) return;
		dragOverStatus = null;
	}

	async function handleDrop(e: DragEvent, toStatus: Status) {
		e.preventDefault();
		if (!dragging) return;

		const { ticket, fromStatus } = dragging;
		dragging = null;
		dragOverStatus = null;

		if (fromStatus === toStatus) return;

		// Optimistic update — move the card immediately
		board[fromStatus] = board[fromStatus].filter((t) => t.id !== ticket.id);
		board[toStatus] = [{ ...ticket, status: toStatus }, ...board[toStatus]];

		// Suppress the trailing onclick that fires after dragend
		recentlyDragged.add(ticket.id);
		setTimeout(() => recentlyDragged.delete(ticket.id), 100);

		try {
			const fd = new FormData();
			fd.append('ticketId', ticket.id);
			fd.append('status', toStatus);
			const res = await fetch('?/updateStatus', { method: 'POST', body: fd });
			if (!res.ok) throw new Error('Failed');
			await invalidateAll();
		} catch {
			// Rollback on error
			board[toStatus] = board[toStatus].filter((t) => t.id !== ticket.id);
			board[fromStatus] = [{ ...ticket }, ...board[fromStatus]];
		}
	}

	function handleCardClick(ticket: Ticket) {
		if (recentlyDragged.has(ticket.id)) {
			recentlyDragged.delete(ticket.id);
			return;
		}
		goto(`/tickets/${ticket.id}`);
	}
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

	<div class="section" style="margin-top: 28px;">
		<div class="section-head">
			<h2>Ticket Board</h2>
			<p class="board-hint">Drag cards between columns to update status</p>
		</div>

		<div class="board">
			{#each STATUSES as status}
				<div
					class="col"
					class:col-over={dragOverStatus === status && dragging?.fromStatus !== status}
					ondragover={(e) => handleDragOver(e, status)}
					ondragleave={handleDragLeave}
					ondrop={(e) => handleDrop(e, status)}
					role="region"
					aria-label="{STATUS_LABELS[status]} column"
				>
					<div class="col-head">
						<span class="col-title">{STATUS_LABELS[status]}</span>
						<span class="col-count">{board[status].length}</span>
					</div>

					<div class="col-cards">
						{#each board[status] as ticket (ticket.id)}
							<div
								class="card"
								class:card-dragging={dragging?.ticket.id === ticket.id}
								draggable="true"
								ondragstart={(e) => handleDragStart(e, ticket, status)}
								ondragend={handleDragEnd}
								onclick={() => handleCardClick(ticket)}
								role="button"
								tabindex="0"
								aria-label="Ticket: {ticket.title}"
								onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(ticket); }}
							>
								<div class="card-title">{ticket.title}</div>
								<div class="card-meta">
									<span class="card-contact">{ticket.contactName}</span>
									<span class="badge badge-type">{TYPE_LABELS[ticket.type] ?? ticket.type}</span>
								</div>
							</div>
						{/each}

						{#if board[status].length === 0}
							<div class="col-empty">No tickets</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.page {
		padding: 32px 36px;
		max-width: 1100px;
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
	.board-hint { font-size: 12.5px; color: #9ca3af; margin: 0; }

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

	/* ── Kanban board ──────────────────────────────────────────────────── */

	.board {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
		align-items: start;
	}

	.col {
		background: #f7f6f3;
		border: 1.5px solid #e5e3df;
		border-radius: 10px;
		padding: 12px;
		min-height: 160px;
		transition: border-color 0.15s, background 0.15s;
	}

	.col-over {
		border-color: #6366f1;
		background: #f4f3ff;
	}

	.col-head {
		display: flex; align-items: center; justify-content: space-between;
		margin-bottom: 10px;
		padding-bottom: 8px;
		border-bottom: 1px solid #e5e3df;
	}

	.col-title {
		font-size: 11.5px;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.col-count {
		font-size: 11.5px;
		font-weight: 500;
		color: #9ca3af;
		background: #eceae6;
		padding: 1px 7px;
		border-radius: 10px;
		line-height: 1.6;
	}

	.col-cards {
		display: flex;
		flex-direction: column;
		gap: 7px;
	}

	.col-empty {
		font-size: 12.5px;
		color: #c4c2be;
		text-align: center;
		padding: 20px 0;
	}

	.card {
		background: white;
		border: 1px solid #e5e3df;
		border-radius: 8px;
		padding: 10px 12px;
		cursor: grab;
		transition: box-shadow 0.1s, opacity 0.15s, border-color 0.1s;
		user-select: none;
	}

	.card:hover {
		box-shadow: 0 1px 5px rgba(0, 0, 0, 0.07);
		border-color: #d1cfcb;
	}

	.card:active {
		cursor: grabbing;
	}

	.card-dragging {
		opacity: 0.35;
	}

	.card-title {
		font-size: 13px;
		font-weight: 500;
		color: #1a1b23;
		margin-bottom: 7px;
		line-height: 1.35;
	}

	.card-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
	}

	.card-contact {
		font-size: 11.5px;
		color: #9ca3af;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
