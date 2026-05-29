<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const MONTH_NAMES = [
		'January','February','March','April','May','June',
		'July','August','September','October','November','December'
	];
	const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

	// Calendar grid for current month
	let calDays = $derived.by(() => {
		const firstDow = new Date(data.year, data.month, 1).getDay();
		const daysInMonth = new Date(data.year, data.month + 1, 0).getDate();
		const cells: (number | null)[] = [];
		for (let i = 0; i < firstDow; i++) cells.push(null);
		for (let d = 1; d <= daysInMonth; d++) cells.push(d);
		while (cells.length % 7 !== 0) cells.push(null);
		return cells;
	});

	// Group meetings by day-of-month for quick lookup
	let meetingsByDay = $derived.by(() => {
		const map: Record<number, typeof data.meetings> = {};
		for (const m of data.meetings) {
			const d = new Date(m.startsAt).getDate();
			if (!map[d]) map[d] = [];
			map[d].push(m);
		}
		return map;
	});

	const today = new Date();
	let isCurrentMonth = $derived(today.getFullYear() === data.year && today.getMonth() === data.month);

	function prevMonth() {
		let y = data.year, m = data.month - 1;
		if (m < 0) { m = 11; y--; }
		goto(`/calendar?year=${y}&month=${m}`);
	}
	function nextMonth() {
		let y = data.year, m = data.month + 1;
		if (m > 11) { m = 0; y++; }
		goto(`/calendar?year=${y}&month=${m}`);
	}

	function fmtTime(d: Date | string): string {
		return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
	}

	// Selected day for detail panel
	let selectedDay = $state<number | null>(null);
	let selectedMeetings = $derived(selectedDay !== null ? (meetingsByDay[selectedDay] ?? []) : []);
</script>

<div class="page">
	<div class="page-header">
		<div>
			<h1>Calendar</h1>
			<p class="page-sub">Schedule and track meetings</p>
		</div>
		<a href="/calendar/new" class="btn-primary">
			<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
				<path d="M6.5 2v9M2 6.5h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
			</svg>
			New Meeting
		</a>
	</div>

	<div class="calendar-layout">
		<div class="calendar-main">
			<!-- Month navigator -->
			<div class="cal-header">
				<button class="nav-btn" onclick={prevMonth} aria-label="Previous month">
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
						<path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
				<span class="month-label">{MONTH_NAMES[data.month]} {data.year}</span>
				<button class="nav-btn" onclick={nextMonth} aria-label="Next month">
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
						<path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>

			<!-- Day-of-week headers -->
			<div class="cal-grid">
				{#each DAY_NAMES as day}
					<div class="cal-dow">{day}</div>
				{/each}

				{#each calDays as cell}
					{#if cell === null}
						<div class="cal-cell empty"></div>
					{:else}
						{@const hasMeetings = !!meetingsByDay[cell]}
						{@const isToday = isCurrentMonth && today.getDate() === cell}
						{@const isSelected = selectedDay === cell}
						<button
							class="cal-cell day {isToday ? 'today' : ''} {isSelected ? 'selected' : ''} {hasMeetings ? 'has-events' : ''}"
							onclick={() => { selectedDay = isSelected ? null : cell; }}
						>
							<span class="day-num">{cell}</span>
							{#if hasMeetings}
								<span class="dot-row">
									{#each meetingsByDay[cell].slice(0, 3) as _}
										<span class="dot"></span>
									{/each}
								</span>
							{/if}
						</button>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Side panel: selected day or upcoming list -->
		<div class="side-panel">
			{#if selectedDay !== null}
				<div class="panel-header">
					<span class="panel-title">{MONTH_NAMES[data.month]} {selectedDay}</span>
					<button class="close-btn" onclick={() => { selectedDay = null; }}>×</button>
				</div>
				{#if selectedMeetings.length === 0}
					<p class="panel-empty">No meetings on this day.</p>
					<a href="/calendar/new" class="btn-small-link">+ Schedule one</a>
				{:else}
					<div class="event-list">
						{#each selectedMeetings as meeting}
							<div class="event-card">
								<div class="event-time">
									{fmtTime(meeting.startsAt)}{meeting.endsAt ? ` – ${fmtTime(meeting.endsAt)}` : ''}
								</div>
								<div class="event-title">{meeting.title}</div>
								{#if meeting.description}
									<div class="event-desc">{meeting.description}</div>
								{/if}
								{#if meeting.ticketId}
									<a href="/tickets/{meeting.ticketId}" class="event-ticket-link">
										<svg width="11" height="11" viewBox="0 0 11 11" fill="none">
											<path d="M1.5 3.5A1 1 0 0 1 2.5 2.5h6a1 1 0 0 1 1 1v1.2a.7.7 0 0 0 0 1.6v1.2a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V7.3a.7.7 0 0 0 0-1.6V3.5z" fill="currentColor" opacity=".7"/>
										</svg>
										{meeting.ticketTitle ?? 'View ticket'}
									</a>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			{:else}
				<div class="panel-header">
					<span class="panel-title">Upcoming</span>
				</div>
				{#if data.meetings.length === 0}
					<p class="panel-empty">No meetings this month.</p>
				{:else}
					<div class="event-list">
						{#each data.meetings as meeting}
							<div class="event-card">
								<div class="event-date-label">
									{new Date(meeting.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
								</div>
								<div class="event-time">{fmtTime(meeting.startsAt)}{meeting.endsAt ? ` – ${fmtTime(meeting.endsAt)}` : ''}</div>
								<div class="event-title">{meeting.title}</div>
								{#if meeting.ticketId}
									<a href="/tickets/{meeting.ticketId}" class="event-ticket-link">
										<svg width="11" height="11" viewBox="0 0 11 11" fill="none">
											<path d="M1.5 3.5A1 1 0 0 1 2.5 2.5h6a1 1 0 0 1 1 1v1.2a.7.7 0 0 0 0 1.6v1.2a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V7.3a.7.7 0 0 0 0-1.6V3.5z" fill="currentColor" opacity=".7"/>
										</svg>
										{meeting.ticketTitle ?? 'View ticket'}
									</a>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
	.page { padding: 32px 36px; max-width: 960px; }
	.page-header {
		display: flex; align-items: flex-start; justify-content: space-between;
		margin-bottom: 24px;
	}
	h1 { font-size: 22px; font-weight: 600; color: #1a1b23; margin: 0 0 4px; letter-spacing: -0.025em; }
	.page-sub { font-size: 13.5px; color: #6b7280; margin: 0; }
	.btn-primary {
		display: inline-flex; align-items: center; gap: 6px;
		background: #6366f1; color: white;
		padding: 8px 14px; border-radius: 8px;
		font-size: 13.5px; font-weight: 500;
		text-decoration: none; white-space: nowrap;
		transition: background 0.13s;
	}
	.btn-primary:hover { background: #4f46e5; }

	.calendar-layout {
		display: grid; grid-template-columns: 1fr 260px;
		gap: 16px; align-items: start;
	}

	/* Calendar main */
	.calendar-main {
		background: white; border: 1px solid #e5e3df;
		border-radius: 12px; overflow: hidden;
	}

	.cal-header {
		display: flex; align-items: center; justify-content: space-between;
		padding: 16px 20px; border-bottom: 1px solid #f0eeea;
	}
	.month-label { font-size: 15px; font-weight: 600; color: #1a1b23; letter-spacing: -0.015em; }
	.nav-btn {
		background: none; border: none; cursor: pointer;
		color: #6b7280; padding: 6px; border-radius: 6px;
		display: flex; align-items: center;
		transition: color 0.12s, background 0.12s;
	}
	.nav-btn:hover { color: #1a1b23; background: #f4f3f0; }

	.cal-grid {
		display: grid; grid-template-columns: repeat(7, 1fr);
	}
	.cal-dow {
		padding: 10px 0 8px;
		text-align: center; font-size: 11.5px; font-weight: 500;
		color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;
		border-bottom: 1px solid #f0eeea;
	}

	.cal-cell {
		aspect-ratio: 1;
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		gap: 3px;
		font-size: 13px; color: #374151;
		border-right: 1px solid #f7f6f3;
		border-bottom: 1px solid #f7f6f3;
	}
	.cal-cell:nth-child(7n) { border-right: none; }
	.cal-cell.empty { background: #fafaf8; }

	button.cal-cell {
		background: none; border-left: none; border-top: none;
		cursor: pointer; transition: background 0.1s;
	}
	button.cal-cell:hover { background: #f4f3f0; }
	button.cal-cell.selected { background: #f4f3ff; }
	button.cal-cell.today .day-num {
		background: #6366f1; color: white;
		border-radius: 50%; width: 24px; height: 24px;
		display: flex; align-items: center; justify-content: center;
		font-size: 12.5px; font-weight: 600;
	}

	.day-num { font-size: 13px; }
	.dot-row { display: flex; gap: 2px; }
	.dot { width: 4px; height: 4px; border-radius: 50%; background: #6366f1; opacity: 0.7; }

	/* Side panel */
	.side-panel {
		background: white; border: 1px solid #e5e3df;
		border-radius: 12px; padding: 18px 18px;
		min-height: 200px;
	}
	.panel-header {
		display: flex; align-items: center; justify-content: space-between;
		margin-bottom: 14px;
	}
	.panel-title { font-size: 14px; font-weight: 600; color: #1a1b23; letter-spacing: -0.015em; }
	.close-btn {
		background: none; border: none; cursor: pointer;
		font-size: 18px; color: #9ca3af; padding: 0 4px;
		line-height: 1; transition: color 0.12s;
	}
	.close-btn:hover { color: #374151; }

	.panel-empty { font-size: 13px; color: #9ca3af; margin: 0 0 12px; }
	.btn-small-link {
		font-size: 13px; color: #6366f1; text-decoration: none;
	}
	.btn-small-link:hover { text-decoration: underline; }

	.event-list { display: flex; flex-direction: column; gap: 10px; }
	.event-card {
		background: #fafaf8; border: 1px solid #f0eeea;
		border-radius: 8px; padding: 10px 12px;
		display: flex; flex-direction: column; gap: 2px;
	}
	.event-date-label { font-size: 11.5px; font-weight: 500; color: #6366f1; margin-bottom: 1px; }
	.event-time { font-size: 11.5px; color: #9ca3af; }
	.event-title { font-size: 13.5px; font-weight: 500; color: #1a1b23; margin-top: 1px; }
	.event-desc { font-size: 12.5px; color: #6b7280; }
	.event-ticket-link {
		display: inline-flex; align-items: center; gap: 4px;
		font-size: 12px; color: #6366f1; text-decoration: none;
		margin-top: 4px;
	}
	.event-ticket-link:hover { text-decoration: underline; }
</style>
