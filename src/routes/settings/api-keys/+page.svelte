<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let copied = $state(false);

	function fmt(d: Date | string | null): string {
		if (!d) return '—';
		return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	async function copyKey() {
		if (form?.created?.key) {
			await navigator.clipboard.writeText(form.created.key);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}

	function confirmRevoke(e: SubmitEvent) {
		if (!confirm('Revoke this API key? This cannot be undone.')) e.preventDefault();
	}
</script>

<div class="page">
	<div class="page-header">
		<div>
			<h1>API Keys</h1>
			<p class="page-sub">Manage API keys for external integrations</p>
		</div>
	</div>

	{#if form?.created}
		<div class="new-key-banner">
			<div class="new-key-header">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
					<circle cx="8" cy="8" r="7" stroke="#059669" stroke-width="1.3"/>
					<path d="M5 8l2.5 2.5L11 5.5" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<span>API key created. Copy it now — it will not be shown again.</span>
			</div>
			<div class="key-display">
				<code class="key-value">{form.created.key}</code>
				<button onclick={copyKey} class="copy-btn {copied ? 'copied' : ''}">
					{#if copied}
						<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
							<path d="M2.5 7l3 3 5-5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						Copied
					{:else}
						<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
							<rect x="4" y="1" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
							<path d="M1 4v8a1 1 0 0 0 1 1h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
						</svg>
						Copy
					{/if}
				</button>
			</div>
		</div>
	{/if}

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
		<div class="main-col">
			<div class="card">
				<h2 class="section-title">Active Keys</h2>
				{#if data.keys.length === 0}
					<div class="empty">No API keys created yet.</div>
				{:else}
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Prefix</th>
								<th>Created</th>
								<th>Last Used</th>
								<th>Status</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each data.keys as key}
								<tr>
									<td class="td-name">{key.name}</td>
									<td><code class="prefix-code">tsk_{key.keyPrefix}_…</code></td>
									<td class="td-muted">{fmt(key.createdAt)}</td>
									<td class="td-muted">{fmt(key.lastUsedAt)}</td>
									<td>
										<span class="badge {key.isActive ? 'badge-active' : 'badge-revoked'}">
											{key.isActive ? 'Active' : 'Revoked'}
										</span>
									</td>
									<td class="td-action">
										{#if key.isActive}
											<form method="post" action="?/revoke" onsubmit={confirmRevoke} use:enhance>
												<input type="hidden" name="id" value={key.id} />
												<button type="submit" class="btn-revoke">Revoke</button>
											</form>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		</div>

		<div class="side-col">
			<div class="card">
				<h2 class="section-title">Create New Key</h2>
				<p class="create-desc">Give your key a descriptive name so you can identify it later.</p>
				<form method="post" action="?/create" use:enhance>
					<div class="field">
						<label for="name">Key name</label>
						<input id="name" name="name" type="text" placeholder="e.g. Website Integration" required />
					</div>
					<button type="submit" class="btn-primary">Generate Key</button>
				</form>
			</div>

			<div class="card info-card">
				<h2 class="section-title">Usage</h2>
				<p class="info-text">Pass your API key in any request:</p>
				<pre class="code-block">X-API-Key: tsk_…</pre>
				<p class="info-text" style="margin-top:10px">Or as a Bearer token:</p>
				<pre class="code-block">Authorization: Bearer tsk_…</pre>
				<p class="info-text" style="margin-top:14px">
					<strong>POST</strong> <code>/api/v1/tickets</code><br/>
					<strong>GET</strong> <code>/api/v1/tickets</code>
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.page { padding: 32px 36px; max-width: 960px; }
	.page-header { margin-bottom: 22px; }
	h1 { font-size: 22px; font-weight: 600; color: #1a1b23; margin: 0 0 4px; letter-spacing: -0.025em; }
	.page-sub { font-size: 13.5px; color: #6b7280; margin: 0; }

	.new-key-banner {
		background: #ecfdf5; border: 1px solid #a7f3d0;
		border-radius: 10px; padding: 16px 18px; margin-bottom: 20px;
	}
	.new-key-header {
		display: flex; align-items: center; gap: 8px;
		font-size: 13.5px; font-weight: 500; color: #065f46;
		margin-bottom: 12px;
	}
	.key-display {
		display: flex; align-items: center; gap: 8px;
		background: white; border: 1px solid #d1fae5;
		border-radius: 8px; padding: 10px 14px;
	}
	.key-value {
		flex: 1; font-family: 'JetBrains Mono', monospace;
		font-size: 12.5px; color: #065f46;
		word-break: break-all;
	}
	.copy-btn {
		display: inline-flex; align-items: center; gap: 5px;
		padding: 6px 11px; border-radius: 6px; border: 1px solid #a7f3d0;
		background: white; color: #059669;
		font-size: 12.5px; font-weight: 500;
		font-family: 'Outfit', system-ui, sans-serif;
		cursor: pointer; white-space: nowrap;
		transition: background 0.12s;
	}
	.copy-btn:hover { background: #ecfdf5; }
	.copy-btn.copied { border-color: #6ee7b7; color: #047857; }

	.error-msg {
		display: flex; align-items: flex-start; gap: 8px;
		background: #fef2f2; border: 1px solid #fecaca;
		color: #b91c1c; border-radius: 8px;
		padding: 10px 12px; font-size: 13px;
		margin-bottom: 20px; line-height: 1.4;
	}

	.layout { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
	.main-col, .side-col { display: flex; flex-direction: column; gap: 14px; }

	.card {
		background: white; border: 1px solid #e5e3df;
		border-radius: 10px; padding: 20px 22px;
	}
	.info-card { background: #fafaf8; }

	.section-title {
		font-size: 12px; font-weight: 500; color: #9ca3af;
		text-transform: uppercase; letter-spacing: 0.05em;
		margin: 0 0 14px;
	}

	table { width: 100%; border-collapse: collapse; }
	th {
		text-align: left; padding: 0 14px 10px;
		font-size: 12px; font-weight: 500; color: #9ca3af;
		text-transform: uppercase; letter-spacing: 0.04em;
	}
	th:first-child { padding-left: 0; }
	td { padding: 11px 14px; border-top: 1px solid #f7f6f3; vertical-align: middle; }
	td:first-child { padding-left: 0; }
	.td-name { font-size: 13.5px; font-weight: 500; color: #1a1b23; }
	.td-muted { font-size: 13px; color: #6b7280; }
	.td-action { text-align: right; padding-right: 0; }

	.prefix-code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px; color: #6366f1;
		background: #f4f3ff; padding: 2px 7px;
		border-radius: 4px;
	}

	.badge {
		display: inline-flex; align-items: center;
		padding: 3px 9px; border-radius: 20px;
		font-size: 12px; font-weight: 500;
	}
	.badge-active { background: #ecfdf5; color: #059669; }
	.badge-revoked { background: #f9fafb; color: #9ca3af; }

	.btn-revoke {
		padding: 5px 12px; border: 1px solid #fca5a5;
		border-radius: 6px; background: white; color: #dc2626;
		font-size: 12.5px; font-weight: 400;
		font-family: 'Outfit', system-ui, sans-serif;
		cursor: pointer; transition: background 0.12s;
	}
	.btn-revoke:hover { background: #fef2f2; }

	.empty { font-size: 13.5px; color: #9ca3af; padding: 8px 0; }

	.create-desc { font-size: 13px; color: #6b7280; margin: 0 0 14px; line-height: 1.5; }

	.field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
	label { font-size: 13px; font-weight: 500; color: #374151; }
	input {
		padding: 9px 11px;
		border: 1px solid #e5e3df; border-radius: 8px;
		font-size: 14px; font-family: 'Outfit', system-ui, sans-serif;
		color: #1a1b23; background: #fafaf8;
		outline: none;
		transition: border-color 0.13s, box-shadow 0.13s, background 0.13s;
	}
	input:focus {
		border-color: #6366f1; background: white;
		box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
	}
	input::placeholder { color: #c4c3bf; }

	.btn-primary {
		width: 100%; padding: 9px;
		border: none; border-radius: 8px;
		background: #6366f1; color: white;
		font-size: 13.5px; font-weight: 500;
		font-family: 'Outfit', system-ui, sans-serif;
		cursor: pointer; transition: background 0.13s;
	}
	.btn-primary:hover { background: #4f46e5; }

	.info-text { font-size: 12.5px; color: #6b7280; margin: 0 0 6px; line-height: 1.5; }
	.code-block {
		background: #f0f0ec; border: 1px solid #e5e3df;
		border-radius: 6px; padding: 8px 10px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 11.5px; color: #374151;
		margin: 0; overflow-x: auto; white-space: pre;
	}
	code { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
</style>
