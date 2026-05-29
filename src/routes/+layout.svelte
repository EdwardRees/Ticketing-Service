<script lang="ts">
	import './layout.css';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const navItems = [
		{
			href: '/',
			label: 'Dashboard',
			exact: true,
			icon: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity=".5"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity=".5"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor"/></svg>`
		},
		{
			href: '/tickets',
			label: 'Tickets',
			exact: false,
			icon: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h8A1.5 1.5 0 0 1 13 4.5v1.293a1 1 0 0 0 0 1.414V8.5A1.5 1.5 0 0 1 11.5 10h-8A1.5 1.5 0 0 1 2 8.5V7.207a1 1 0 0 0 0-1.414V4.5z" fill="currentColor" opacity=".9"/><path d="M4.5 6.5h6M4.5 8h4" stroke="white" stroke-width="1" stroke-linecap="round"/></svg>`
		},
		{
			href: '/calendar',
			label: 'Calendar',
			exact: false,
			icon: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1.5 6h12" stroke="currentColor" stroke-width="1.3"/><path d="M5 1.5V3.5M10 1.5V3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="5" cy="9" r=".8" fill="currentColor"/><circle cx="7.5" cy="9" r=".8" fill="currentColor"/><circle cx="10" cy="9" r=".8" fill="currentColor"/></svg>`
		},
		{
			href: '/settings/api-keys',
			label: 'API Keys',
			exact: false,
			icon: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="5.5" cy="6.5" r="3.5" stroke="currentColor" stroke-width="1.3"/><path d="M8.5 9l5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M11.5 11.5l1.5 1.5-1.5 1.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`
		}
	];

	function isActive(href: string, exact: boolean): boolean {
		if (exact) return data.path === href;
		return data.path.startsWith(href);
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
	<link
		href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if data.user}
	<div class="shell">
		<aside class="sidebar">
			<div class="sidebar-top">
				<div class="brand">
					<div class="brand-icon">
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
							<path d="M2 4h10M2 7h7M2 10h8" stroke="white" stroke-width="1.6" stroke-linecap="round" />
						</svg>
					</div>
					<span class="brand-name">Ticketing</span>
				</div>

				<nav class="nav">
					{#each navItems as item}
						<a href={item.href} class="nav-link {isActive(item.href, item.exact) ? 'active' : ''}">
							{@html item.icon}
							{item.label}
						</a>
					{/each}
				</nav>
			</div>

			<div class="sidebar-bottom">
				<div class="user">
					<div class="avatar">{data.user.name[0].toUpperCase()}</div>
					<div class="user-text">
						<span class="user-name">{data.user.name}</span>
						<span class="user-email">{data.user.email}</span>
					</div>
				</div>
				<form method="post" action="/logout">
					<button type="submit" class="logout-btn" title="Sign out">
						<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
							<path d="M4.5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2.5M8.5 9.5L11 7l-2.5-2.5M11 7H4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				</form>
			</div>
		</aside>

		<main class="content">
			{@render children()}
		</main>
	</div>
{:else}
	<div class="auth-shell">
		{@render children()}
	</div>
{/if}

<style>
	:global(*, *::before, *::after) { box-sizing: border-box; }
	:global(html, body) {
		margin: 0; padding: 0; height: 100%;
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 14px;
		-webkit-font-smoothing: antialiased;
	}

	.shell {
		display: flex;
		height: 100vh;
		overflow: hidden;
	}

	/* ── Sidebar ─────────────────────────────────────────────── */
	.sidebar {
		width: 216px;
		flex-shrink: 0;
		background: #0c0e13;
		border-right: 1px solid rgba(255,255,255,0.055);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.sidebar-top { display: flex; flex-direction: column; }

	.brand {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 18px 14px 14px;
		border-bottom: 1px solid rgba(255,255,255,0.055);
	}
	.brand-icon {
		width: 26px; height: 26px;
		border-radius: 7px;
		background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
		display: flex; align-items: center; justify-content: center;
		flex-shrink: 0;
	}
	.brand-name {
		font-size: 14.5px;
		font-weight: 600;
		color: #e4e5ed;
		letter-spacing: -0.015em;
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding: 10px 8px;
	}
	.nav-link {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 7px 9px;
		border-radius: 6px;
		text-decoration: none;
		font-size: 13.5px;
		font-weight: 400;
		color: #5a6070;
		transition: color 0.12s, background 0.12s;
	}
	.nav-link :global(svg) { flex-shrink: 0; }
	.nav-link:hover { background: rgba(255,255,255,0.055); color: #bbbdc8; }
	.nav-link.active { background: rgba(99,102,241,0.14); color: #a5b4fc; font-weight: 500; }

	/* ── Sidebar footer ──────────────────────────────────────── */
	.sidebar-bottom {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 10px;
		border-top: 1px solid rgba(255,255,255,0.055);
	}
	.user { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
	.avatar {
		width: 26px; height: 26px;
		border-radius: 7px;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: white;
		font-size: 11.5px;
		font-weight: 600;
		display: flex; align-items: center; justify-content: center;
		flex-shrink: 0;
	}
	.user-text { display: flex; flex-direction: column; min-width: 0; }
	.user-name { font-size: 12px; font-weight: 500; color: #bbbdc8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.user-email { font-size: 11px; color: #3d4250; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

	.logout-btn {
		background: none; border: none; cursor: pointer;
		color: #3d4250; padding: 5px; border-radius: 5px;
		display: flex; align-items: center;
		transition: color 0.12s, background 0.12s;
		flex-shrink: 0;
	}
	.logout-btn:hover { color: #7c8494; background: rgba(255,255,255,0.055); }

	/* ── Content ─────────────────────────────────────────────── */
	.content {
		flex: 1;
		overflow-y: auto;
		background: #f3f2ef;
	}

	.auth-shell {
		min-height: 100vh;
		background: #f3f2ef;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
