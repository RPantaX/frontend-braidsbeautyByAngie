export abstract class StorageService implements Storage {
	get length(): number {
		return this._api.length;
	}

	constructor(protected readonly _api: Storage) {}

	setItem(key: string, value: unknown): void {
		this._api.setItem(key, JSON.stringify(value));
	}

	getItem<T>(key: string): T | null;
	getItem<T>(key: string, otherwise: T): T;
	getItem<T>(key: string, otherwise?: T): T | null {
		const data: string | null = this._api.getItem(key);

		if (data !== null) {
			return JSON.parse(data) as T;
		}

		if (otherwise) {
			return otherwise;
		}

		return null;
	}

	removeItem(key: string): void {
		this._api.removeItem(key);
	}

	clear(): void {
		this._api.clear();
	}

	key(index: number): string | null {
		return this._api.key(index);
	}
}
