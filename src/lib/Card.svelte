<script lang="ts">
  import { type Snippet } from "svelte";
  import Action from "./Action.svelte";

  interface Props {
    title: string;
    description: string;
    imageUrl?: string;
    imageAlt?: string;
    badge?: {
      text: string;
      subtext?: string;
      type?: 'date' | 'price' | 'meta';
    };
    meta?: {
      left?: string;
      right?: string;
      rightType?: 'free' | 'price' | 'default';
    };
    actions: Array<{
      text: string;
      href: string;
      target?: string;
    }>;
    animationDelay?: number;
    placeholderText?: string;
    minHeight?: string;
  }

  const {
    title,
    description,
    imageUrl,
    imageAlt = title,
    badge,
    meta,
    actions,
    animationDelay = 0,
    placeholderText = "UCSD",
    minHeight = "300px"
  }: Props = $props();
</script>

<article class="card" style="--delay: {animationDelay}s; --min-height: {minHeight};">
  <div class="card-image">
    {#if imageUrl}
      <img 
        src={imageUrl} 
        alt={imageAlt}
        loading="lazy"
      />
    {:else}
      <div class="placeholder-image">
        <span>{placeholderText}</span>
      </div>
    {/if}
    
    {#if badge}
      <div class="card-badge" class:date-badge={badge.type === 'date'}>
        <span class="badge-text">{badge.text}</span>
        {#if badge.subtext}
          <span class="badge-subtext">{badge.subtext}</span>
        {/if}
      </div>
    {/if}
  </div>
  
  <div class="card-content">
    {#if meta}
      <div class="card-meta">
        {#if meta.left}
          <span class="meta-left">{meta.left}</span>
        {/if}
        {#if meta.right}
          <span class="meta-right" class:free={meta.rightType === 'free'} class:price={meta.rightType === 'price'}>
            {meta.right}
          </span>
        {/if}
      </div>
    {/if}
    
    <h3 class="card-title">{title}</h3>
    <p class="card-description">{description}</p>
    
    <div class="card-actions">
      {#each actions as action}
        <Action href={action.href} target={action.target}>
          {action.text}
        </Action>
      {/each}
    </div>
  </div>
</article>

<style>
  .card {
    background: var(--card-background, #ffffff);
    border-radius: 16px;
    overflow: hidden;
    height: 100%;
    max-width: 500px;
    min-height: var(--min-height, 300px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transition:
      transform var(--primary-transition),
      box-shadow var(--primary-transition);
    opacity: 0;
    transform: translateY(30px);
    animation: slideInUp var(--slow-transition) ease-out forwards;
    animation-delay: var(--delay);
  }

  .card:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  }

  .card-image {
    position: relative;
    width: 100%;
    height: 240px;
    overflow: hidden;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--primary-transition);
  }

  .card:hover .card-image img {
    transform: scale(1.05);
  }

  .placeholder-image {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--rose-gold), var(--rose-gold-dark));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .card-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    background: var(--rose-gold);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .card-badge.date-badge {
    left: 16px;
    right: auto;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    color: var(--text-primary);
    padding: 8px 12px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .badge-text {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-subtext {
    display: block;
    font-size: 0.75rem;
    opacity: 0.8;
    margin-top: 2px;
  }

  .card-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .meta-left {
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .meta-right {
    font-size: 0.85rem;
    padding: 4px 8px;
    border-radius: 4px;
    background: var(--rose-gold);
    color: white;
    font-weight: 600;
  }

  .meta-right.free {
    background: var(--success-color, #10b981);
  }

  .meta-right.price {
    background: var(--rose-gold);
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  .card-description {
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 20px;
  }

  .card-actions {
    display: flex;
    gap: 12px;
    margin-top: auto;
  }

  @keyframes slideInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .card-actions {
      flex-direction: column;
    }
  }
</style>
