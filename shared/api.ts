import { SignalLike } from "$fresh/src/types.ts";

export interface TodoList {
  isPublic: boolean | SignalLike<boolean | undefined> | undefined;
  ownerId: string;
  items: TodoListItem[];
}

export interface TodoListItem {
  // Non-empty in API request and response
  id?: string;

  // Non-empty in API response
  versionstamp?: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}
