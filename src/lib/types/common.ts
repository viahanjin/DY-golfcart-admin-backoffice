import type { ComponentType } from 'svelte';

export type StatItem = {
	label: string;
	value: number | string;
	icon: ComponentType;
	color?: string;
};

export type ColumnDefinition<T extends Record<string, any>> = {
	key: (keyof T & string) | 'select' | 'actions';
	label: string;
	sortable?: boolean;
	class?: string; // e.g. 'w-24 text-center'
};