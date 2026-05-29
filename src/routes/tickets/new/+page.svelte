<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<div class="page">
	<div class="page-header">
		<a href="/tickets" class="back-link">
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
				<path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			Back to tickets
		</a>
		<h1>New Ticket</h1>
	</div>

	<div class="card">
		{#if form?.error}
			<div class="error-msg">
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;margin-top:1px">
					<circle cx="7" cy="7" r="6" stroke="#b91c1c" stroke-width="1.3"/>
					<path d="M7 4v3.5M7 9.5v.5" stroke="#b91c1c" stroke-width="1.3" stroke-linecap="round"/>
				</svg>
				{form.error}
			</div>
		{/if}

		<form method="post">
			<div class="field">
				<label for="title">Title <span class="req">*</span></label>
				<input id="title" name="title" type="text" placeholder="Brief summary of the issue" required />
			</div>

			<div class="field">
				<label for="description">Description <span class="req">*</span></label>
				<textarea id="description" name="description" rows="5" placeholder="Describe the issue in detail..." required></textarea>
			</div>

			<div class="field-row">
				<div class="field">
					<label for="type">Type <span class="req">*</span></label>
					<select id="type" name="type" required>
						<option value="" disabled selected>Select a type</option>
						<option value="mobile">Mobile</option>
						<option value="web">Web</option>
						<option value="system_design">System Design</option>
						<option value="tutoring">Tutoring</option>
						<option value="other">Other</option>
					</select>
				</div>
			</div>

			<div class="divider"></div>

			<p class="section-label">Contact Information</p>

			<div class="field-row">
				<div class="field">
					<label for="contactName">Name <span class="req">*</span></label>
					<input id="contactName" name="contactName" type="text" placeholder="Jane Smith" required />
				</div>
				<div class="field">
					<label for="contactEmail">Email <span class="req">*</span></label>
					<input id="contactEmail" name="contactEmail" type="email" placeholder="jane@example.com" required />
				</div>
			</div>

			<div class="form-actions">
				<a href="/tickets" class="btn-ghost">Cancel</a>
				<button type="submit" class="btn-primary">Create Ticket</button>
			</div>
		</form>
	</div>
</div>

<style>
	.page { padding: 32px 36px; max-width: 720px; }
	.page-header { margin-bottom: 20px; }
	.back-link {
		display: inline-flex; align-items: center; gap: 6px;
		font-size: 13px; color: #6b7280; text-decoration: none;
		margin-bottom: 12px;
		transition: color 0.12s;
	}
	.back-link:hover { color: #374151; }
	h1 { font-size: 22px; font-weight: 600; color: #1a1b23; margin: 0; letter-spacing: -0.025em; }

	.card {
		background: white; border: 1px solid #e5e3df;
		border-radius: 12px; padding: 28px 28px;
	}

	.error-msg {
		display: flex; align-items: flex-start; gap: 8px;
		background: #fef2f2; border: 1px solid #fecaca;
		color: #b91c1c; border-radius: 8px;
		padding: 10px 12px; font-size: 13px;
		margin-bottom: 20px; line-height: 1.4;
	}

	.field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
	.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
	.field-row .field { margin-bottom: 16px; }

	label { font-size: 13px; font-weight: 500; color: #374151; }
	.req { color: #6366f1; }
	.section-label { font-size: 12px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 14px; }

	input, textarea, select {
		padding: 9px 11px;
		border: 1px solid #e5e3df;
		border-radius: 8px;
		font-size: 14px; font-family: 'Outfit', system-ui, sans-serif;
		color: #1a1b23; background: #fafaf8;
		outline: none;
		transition: border-color 0.13s, box-shadow 0.13s, background 0.13s;
	}
	input:focus, textarea:focus, select:focus {
		border-color: #6366f1; background: white;
		box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
	}
	input::placeholder, textarea::placeholder { color: #c4c3bf; }
	textarea { resize: vertical; min-height: 100px; line-height: 1.5; }
	select { cursor: pointer; appearance: none;
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-repeat: no-repeat; background-position: right 10px center; background-size: 16px;
		padding-right: 32px;
	}

	.divider { border: none; border-top: 1px solid #f0eeea; margin: 20px 0 18px; }

	.form-actions {
		display: flex; justify-content: flex-end; gap: 10px;
		margin-top: 24px; padding-top: 20px;
		border-top: 1px solid #f0eeea;
	}
	.btn-primary {
		display: inline-flex; align-items: center;
		background: #6366f1; color: white;
		padding: 9px 18px; border: none; border-radius: 8px;
		font-size: 13.5px; font-weight: 500;
		font-family: 'Outfit', system-ui, sans-serif;
		cursor: pointer; transition: background 0.13s;
	}
	.btn-primary:hover { background: #4f46e5; }
	.btn-ghost {
		display: inline-flex; align-items: center;
		background: transparent; color: #6b7280;
		padding: 9px 16px; border: 1px solid #e5e3df; border-radius: 8px;
		font-size: 13.5px; font-weight: 400;
		text-decoration: none; transition: border-color 0.13s, color 0.13s;
	}
	.btn-ghost:hover { border-color: #d1cfcb; color: #374151; }
</style>
