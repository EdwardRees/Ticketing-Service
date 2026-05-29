<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<div class="login-wrap">
	<div class="login-card">
		<div class="brand">
			<div class="brand-icon">
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
					<path d="M2 4h10M2 7h7M2 10h8" stroke="white" stroke-width="1.6" stroke-linecap="round" />
				</svg>
			</div>
			<span class="brand-name">Ticketing</span>
		</div>

		<h1>Welcome back</h1>
		<p class="subtitle">Sign in to your account</p>

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
				<label for="email">Email address</label>
				<input
					id="email"
					name="email"
					type="email"
					placeholder="you@example.com"
					autocomplete="email"
					required
				/>
			</div>

			<div class="field">
				<label for="password">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="••••••••"
					autocomplete="current-password"
					required
				/>
			</div>

			<button type="submit" class="submit-btn">Sign in</button>
		</form>
	</div>
</div>

<style>
	.login-wrap {
		width: 100%;
		max-width: 380px;
		padding: 20px;
	}
	.login-card {
		background: #fff;
		border: 1px solid #e5e3df;
		border-radius: 14px;
		padding: 36px 32px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02);
	}
	.brand {
		display: flex; align-items: center; gap: 9px;
		margin-bottom: 28px;
	}
	.brand-icon {
		width: 28px; height: 28px;
		border-radius: 8px;
		background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
		display: flex; align-items: center; justify-content: center;
	}
	.brand-name {
		font-size: 16px; font-weight: 600;
		color: #1a1b23; letter-spacing: -0.02em;
	}
	h1 {
		font-size: 22px; font-weight: 600;
		color: #1a1b23; margin: 0 0 5px;
		letter-spacing: -0.025em;
	}
	.subtitle {
		font-size: 13.5px; color: #6b7280;
		margin: 0 0 24px;
	}
	.error-msg {
		display: flex; align-items: flex-start; gap: 8px;
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #b91c1c;
		border-radius: 8px;
		padding: 10px 12px;
		font-size: 13px;
		margin-bottom: 18px;
		line-height: 1.4;
	}
	.field {
		display: flex; flex-direction: column; gap: 5px;
		margin-bottom: 14px;
	}
	label {
		font-size: 13px; font-weight: 500; color: #374151;
	}
	input {
		padding: 9px 11px;
		border: 1px solid #e5e3df;
		border-radius: 8px;
		font-size: 14px;
		font-family: 'Outfit', system-ui, sans-serif;
		color: #1a1b23;
		background: #fafaf8;
		outline: none;
		transition: border-color 0.13s, box-shadow 0.13s, background 0.13s;
	}
	input:focus {
		border-color: #6366f1;
		background: #fff;
		box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
	}
	input::placeholder { color: #c4c3bf; }
	.submit-btn {
		width: 100%;
		margin-top: 10px;
		padding: 10px;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		font-family: 'Outfit', system-ui, sans-serif;
		cursor: pointer;
		transition: background 0.13s, transform 0.08s;
		letter-spacing: -0.01em;
	}
	.submit-btn:hover { background: #4f46e5; }
	.submit-btn:active { transform: scale(0.985); }
</style>
