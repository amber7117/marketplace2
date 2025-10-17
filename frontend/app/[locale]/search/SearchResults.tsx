interface SearchResultsProps {
	query: string;
	locale: string;
}

export async function SearchResults({ query, locale }: SearchResultsProps) {
	const normalizedQuery = query.trim();

	if (!normalizedQuery) {
		return (
			<section
				className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground"
				data-locale={locale}
			>
				Enter a keyword to start searching.
			</section>
		);
	}

	return (
		<section className="rounded-md border p-6" data-locale={locale}>
			<p className="text-sm text-muted-foreground">
				Results for <div className="font-medium text-foreground">&quot;{normalizedQuery}&quot;</div> will appear here soon.
			</p>
		</section>
	);
}
