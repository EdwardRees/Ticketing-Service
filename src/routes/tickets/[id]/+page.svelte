<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const TYPE_LABELS: Record<string, string> = {
		mobile: 'Mobile', web: 'Web', system_design: 'System Design',
		tutoring: 'Tutoring', other: 'Other'
	};
	const STATUS_LABELS: Record<string, string> = {
		open: 'Open', in_progress: 'In Progress',
		resolved: 'Resolved', closed: 'Closed'
	};

	function fmt(d: Date | string): string {
		return new Date(d).toLocaleString('en-US', {
			month: 'short', day: 'numeric', year: 'numeric',
			hour: '2-digit', minute: '2-digit'
		});
	}

	function fmtDate(d: Date | string): string {
		return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function fmtTime(d: Date | string): string {
		return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
	}

	function confirmDelete(e: SubmitEvent) {
		if (!confirm('Delete this ticket? This action cannot be undone.')) e.preventDefault();
	}

	function confirmDeleteNote(e: SubmitEvent) {
		if (!confirm('Delete this note?')) e.preventDefault();
	}

	let noteText = $state('');
</script>

<div class="page">
	<div class="page-header">
		<a href="/tickets" class="back-link">
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
				<path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			Back to tickets
		</a>
		<div class="header-row">
			<h1>{data.ticket.title}</h1>
			<span class="badge badge-{data.ticket.status}">{STATUS_LABELS[data.ticket.status] ?? data.ticket.status}</span>
		</div>
		<p class="ticket-meta">#{data.ticket.id.slice(0, 8)} · Created {fmt(data.ticket.createdAt)}</p>
	</div>

	{#if form?.error}
		<div class="error-msg">
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;margin-top:1px">
				<circle cx="7" cy="7" r="6" stroke="#b91c1c" stroke-width="1.3"/>
				<path d="M7 4v3.5M7 9.5v.5" stroke="#b91c1c" stroke-width="1.3" stroke-linecap="round"/>
			</svg>
			{form.error}
		</div>
	{/if}

	<div class="layout">
		<!-- Left column: description + notes + meetings -->
		<div class="main-col">
			<div class="card">
				<h2 class="section-title">Description</h2>
				<p class="description">{data.ticket.description}</p>
			</div>

			<!-- Notes -->
			<div class="card">
				<h2 class="section-title">Notes</h2>

				{#if data.notes.length === 0 && !form?.noteAdded}
					<p class="empty-inline">No notes yet.</p>
				{:else}
					<div class="notes-list">
						{#each data.notes as note}
							<div class="note-item">
								<p class="note-content">{note.content}</p>
								<div class="note-footer">
									<span class="note-date">{fmt(note.createdAt)}</span>
									<form method="post" action="?/deleteNote" onsubmit={confirmDeleteNote} use:enhance>
										<input type="hidden" name="id" value={note.id} />
										<button type="submit" class="note-delete-btn">Delete</button>
									</form>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<form method="post" action="?/addNote" use:enhance onsubmit={() => { noteText = ''; }}>
					<div class="note-input-group">
						<textarea
							name="content"
							bind:value={noteText}
							rows="3"
							placeholder="Add a note…"
							class="note-textarea"
						></textarea>
						<button type="submit" class="btn-add-note" disabled={!noteText.trim()}>Add Note</button>
					</div>
				</form>
			</div>

			<!-- Linked meetings -->
			<div class="card">
				<div class="card-header-row">
					<h2 class="section-title" style="margin:0">Meetings</h2>
					<a href="/calendar/new?ticketId={data.ticket.id}" class="btn-small">+ Schedule</a>
				</div>

				{#if data.meetings.length === 0}
					<p class="empty-inline" style="margin-top:12px">No meetings linked to this ticket.</p>
				{:else}
					<div class="meetings-list">
						{#each data.meetings as meeting}
							<div class="meeting-item">
								<div class="meeting-time">
									<span class="meeting-date">{fmtDate(meeting.startsAt)}</span>
									<span class="meeting-hour">{fmtTime(meeting.startsAt)}{meeting.endsAt ? ` – ${fmtTime(meeting.endsAt)}` : ''}</span>
								</div>
								<div class="meeting-body">
									<span class="meeting-title">{meeting.title}</span>
									{#if meeting.description}
										<span class="meeting-desc">{meeting.description}</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Right sidebar -->
		<div class="side-col">
			<div class="card">
				<h2 class="section-title">Details</h2>
				<dl class="detail-list">
					<div class="detail-row">
						<dt>Type</dt>
						<dd><span class="badge badge-type">{TYPE_LABELS[data.ticket.type] ?? data.ticket.type}</span></dd>
					</div>
					<div class="detail-row">
						<dt>Contact</dt>
						<dd>{data.ticket.contactName}</dd>
					</div>
					<div class="detail-row">
						<dt>Email</dt>
						<dd><a href="mailto:{data.ticket.contactEmail}" class="email-link">{data.ticket.contactEmail}</a></dd>
					</div>
					<div class="detail-row">
						<dt>Updated</dt>
						<dd class="muted">{fmt(data.ticket.updatedAt)}</dd>
					</div>
				</dl>
			</div>

			<div class="card">
				<h2 class="section-title">Update Status</h2>
				<form method="post" action="?/updateStatus" use:enhance>
					<select name="status" class="status-select">
						<option value="open" selected={data.ticket.status === 'open'}>Open</option>
						<option value="in_progress" selected={data.ticket.status === 'in_progress'}>In Progress</option>
						<option value="resolved" selected={data.ticket.status === 'resolved'}>Resolved</option>
						<option value="closed" selected={data.ticket.status === 'closed'}>Closed</option>
					</select>
					<button type="submit" class="btn-update">Update Status</button>
				</form>
			</div>

			<div class="card card-danger">
				<h2 class="section-title danger-title">Danger Zone</h2>
				<p class="danger-desc">Permanently delete this ticket and all its notes.</p>
				<form method="post" action="?/delete" onsubmit={confirmDelete}>
					<button type="submit" class="btn-delete">Delete Ticket</button>
				</form>
			</div>
		</div>
	</div>
</div>

<style>
	.page { padding: 32px 36px; max-width: 960px; }
	.page-header { margin-bottom: 24px; }
	.back-link {
		display: inline-flex; align-items: center; gap: 6px;
		font-size: 13px; color: #6b7280; text-decoration: none;
		margin-bottom: 14px; transition: color 0.12s;
	}
	.back-link:hover { color: #374151; }
	.header-row { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; flex-wrap: wrap; }
	h1 { font-size: 20px; font-weight: 600; color: #1a1b23; margin: 0; letter-spacing: -0.02em; }
	.ticket-meta { font-size: 12.5px; color: #9ca3af; margin: 0; font-family: 'JetBrains Mono', monospace; }

	.error-msg {
		display: flex; align-items: flex-start; gap: 8px;
		background: #fef2f2; border: 1px solid #fecaca;
		color: #b91c1c; border-radius: 8px;
		padding: 10px 12px; font-size: 13px;
		margin-bottom: 20px; line-height: 1.4;
	}

	.layout { display: grid; grid-template-columns: 1fr 280px; gap: 16px; align-items: start; }
	.main-col, .side-col { display: flex; flex-direction: column; gap: 14px; }

	.card {
		background: white; border: 1px solid #e5e3df;
		border-radius: 10px; padding: 20px 22px;
	}
	.card-danger { border-color: #fee2e2; }
	.card-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }

	.section-title {
		font-size: 12px; font-weight: 500; color: #9ca3af;
		text-transform: uppercase; letter-spacing: 0.05em;
		margin: 0 0 14px;
	}
	.danger-title { color: #f87171; }

	.description {
		font-size: 14px; color: #374151; line-height: 1.65;
		margin: 0; white-space: pre-wrap;
	}

	/* Notes */
	.empty-inline { font-size: 13px; color: #9ca3af; margin: 0 0 16px; }
	.notes-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
	.note-item {
		background: #fafaf8; border: 1px solid #f0eeea;
		border-radius: 8px; padding: 12px 14px;
	}
	.note-content { font-size: 13.5px; color: #374151; margin: 0 0 8px; line-height: 1.55; white-space: pre-wrap; }
	.note-footer { display: flex; align-items: center; justify-content: space-between; }
	.note-date { font-size: 11.5px; color: #9ca3af; }
	.note-delete-btn {
		background: none; border: none; cursor: pointer;
		font-size: 11.5px; color: #9ca3af;
		font-family: 'Outfit', system-ui, sans-serif;
		padding: 0; transition: color 0.12s;
	}
	.note-delete-btn:hover { color: #dc2626; }

	.note-input-group { display: flex; flex-direction: column; gap: 8px; }
	.note-textarea {
		width: 100%; padding: 9px 11px;
		border: 1px solid #e5e3df; border-radius: 8px;
		font-size: 13.5px; font-family: 'Outfit', system-ui, sans-serif;
		color: #1a1b23; background: #fafaf8;
		resize: vertical; min-height: 72px; line-height: 1.5;
		outline: none; transition: border-color 0.13s, box-shadow 0.13s;
	}
	.note-textarea:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
	.note-textarea::placeholder { color: #c4c3bf; }
	.btn-add-note {
		align-self: flex-end;
		padding: 7px 16px; border: none; border-radius: 7px;
		background: #6366f1; color: white;
		font-size: 13px; font-weight: 500;
		font-family: 'Outfit', system-ui, sans-serif;
		cursor: pointer; transition: background 0.13s, opacity 0.13s;
	}
	.btn-add-note:hover { background: #4f46e5; }
	.btn-add-note:disabled { opacity: 0.4; cursor: not-allowed; }

	/* Meetings */
	.btn-small {
		display: inline-flex; align-items: center;
		padding: 5px 11px; border-radius: 6px;
		background: #f4f3ff; color: #6366f1;
		font-size: 12.5px; font-weight: 500;
		text-decoration: none; transition: background 0.12s;
	}
	.btn-small:hover { background: #ede9fe; }

	.meetings-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
	.meeting-item {
		display: flex; gap: 14px; align-items: flex-start;
		padding: 10px 12px;
		background: #fafaf8; border: 1px solid #f0eeea;
		border-radius: 8px;
	}
	.meeting-time { display: flex; flex-direction: column; gap: 2px; min-width: 90px; }
	.meeting-date { font-size: 12px; font-weight: 500; color: #6366f1; }
	.meeting-hour { font-size: 11.5px; color: #9ca3af; }
	.meeting-body { display: flex; flex-direction: column; gap: 2px; }
	.meeting-title { font-size: 13.5px; font-weight: 500; color: #1a1b23; }
	.meeting-desc { font-size: 12.5px; color: #6b7280; }

	/* Details sidebar */
	.detail-list { margin: 0; }
	.detail-row {
		display: grid; grid-template-columns: 72px 1fr;
		gap: 8px; align-items: center;
		padding: 7px 0; border-bottom: 1px solid #f7f6f3;
	}
	.detail-row:last-child { border-bottom: none; }
	dt { font-size: 12.5px; color: #9ca3af; }
	dd { font-size: 13px; color: #374151; margin: 0; }
	dd.muted { color: #9ca3af; }
	.email-link { color: #6366f1; text-decoration: none; }
	.email-link:hover { text-decoration: underline; }

	.status-select {
		width: 100%; padding: 9px 11px; margin-bottom: 10px;
		border: 1px solid #e5e3df; border-radius: 8px;
		font-size: 13.5px; font-family: 'Outfit', system-ui, sans-serif;
		color: #1a1b23; background: #fafaf8;
		outline: none; cursor: pointer; appearance: none;
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-repeat: no-repeat; background-position: right 10px center; background-size: 16px;
		padding-right: 32px;
		transition: border-color 0.13s, box-shadow 0.13s;
	}
	.status-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); background-color: white; }

	.btn-update {
		width: 100%; padding: 9px; border: none; border-radius: 8px;
		background: #6366f1; color: white;
		font-size: 13.5px; font-weight: 500;
		font-family: 'Outfit', system-ui, sans-serif;
		cursor: pointer; transition: background 0.13s;
	}
	.btn-update:hover { background: #4f46e5; }

	.danger-desc { font-size: 13px; color: #6b7280; margin: 0 0 14px; line-height: 1.5; }
	.btn-delete {
		width: 100%; padding: 9px; border: 1px solid #fca5a5; border-radius: 8px;
		background: #fff; color: #dc2626;
		font-size: 13.5px; font-weight: 500;
		font-family: 'Outfit', system-ui, sans-serif;
		cursor: pointer; transition: background 0.13s, border-color 0.13s;
	}
	.btn-delete:hover { background: #fef2f2; border-color: #f87171; }

	.badge {
		display: inline-flex; align-items: center;
		padding: 3px 10px; border-radius: 20px;
		font-size: 12px; font-weight: 500;
	}
	.badge-type { background: #f4f3ff; color: #6366f1; }
	.badge-open { background: #eff6ff; color: #2563eb; }
	.badge-in_progress { background: #fffbeb; color: #d97706; }
	.badge-resolved { background: #ecfdf5; color: #059669; }
	.badge-closed { background: #f9fafb; color: #6b7280; }
</style>
