import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { deleteProduct, listProducts, type ProductSort } from '../api/admin';
import { formatNaira } from '../api/client';
import type { Product } from '../api/types';
import { Alert, Badge, Button, Card, Input, PageHeader, Select } from '../components/ui';

type LayoutMode = 'grid' | 'list';
type ActiveFilter = 'all' | 'active' | 'inactive';

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name_asc', label: 'Name A → Z' },
  { value: 'name_desc', label: 'Name Z → A' },
  { value: 'price_asc', label: 'Price low → high' },
  { value: 'price_desc', label: 'Price high → low' },
];

const PER_PAGE = 20;

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sort, setSort] = useState<ProductSort>('newest');
  const [layout, setLayout] = useState<LayoutMode>('grid');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const activeParam =
    activeFilter === 'all' ? undefined : activeFilter === 'active';

  const fetchPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const result = await listProducts({
          search: appliedSearch || undefined,
          active: activeParam,
          sort,
          page: pageNum,
          per_page: PER_PAGE,
        });

        setTotal(result.meta.total);
        setHasMore(result.meta.current_page < result.meta.last_page);
        setPage(result.meta.current_page);

        setProducts((prev) => (replace ? result.data : [...prev, ...result.data]));
      } catch {
        setError('Could not load products.');
        if (replace) setProducts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [appliedSearch, activeParam, sort],
  );

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore || loading || loadingMore) return;

    const scrollRoot = document.querySelector('main');

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading && !loadingMore) {
          fetchPage(page + 1, false);
        }
      },
      { root: scrollRoot, rootMargin: '200px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchPage, hasMore, loading, loadingMore, page]);

  function applySearch() {
    setAppliedSearch(search.trim());
  }

  async function handleDelete(id: number) {
    if (!confirm('Deactivate this product?')) return;
    await deleteProduct(id);
    fetchPage(1, true);
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={total > 0 ? `${products.length} of ${total} loaded` : 'Manage shop catalog'}
        action={
          <Link to="/products/new" className="w-full sm:w-auto">
            <Button className="w-full">Add product</Button>
          </Link>
        }
      />

      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            className="flex-1"
          />
          <Button variant="outline" onClick={applySearch} className="sm:min-w-[100px]">
            Search
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as ProductSort)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
            aria-label="Filter by status"
          >
            <option value="all">All status</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </Select>
          <div className="flex border border-stone-300 bg-white">
            <button
              type="button"
              onClick={() => setLayout('grid')}
              className={`min-h-[44px] flex-1 border-r border-stone-300 px-3 py-2 text-sm font-medium transition ${
                layout === 'grid' ? 'bg-brand text-white' : 'text-stone-600 hover:text-brand'
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setLayout('list')}
              className={`min-h-[44px] flex-1 px-3 py-2 text-sm font-medium transition ${
                layout === 'list' ? 'bg-brand text-white' : 'text-stone-600 hover:text-brand'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {loading && products.length === 0 ? <p className="text-stone-500">Loading…</p> : null}

      {!loading && products.length === 0 ? (
        <p className="py-12 text-center text-stone-500">No products found.</p>
      ) : null}

      {layout === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <ProductListRow key={p.id} product={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <div ref={loadMoreRef} className="py-8 text-center text-sm text-stone-500">
        {loadingMore ? 'Loading more…' : hasMore ? 'Scroll for more' : products.length > 0 ? 'All products loaded' : null}
      </div>
    </div>
  );
}

function ProductCard({ product: p, onDelete }: { product: Product; onDelete: (id: number) => void }) {
  return (
    <Card className="overflow-hidden">
      {p.image_url ? (
        <img src={p.image_url} alt={p.name} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-cream font-bold text-brand">No image</div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-900">{p.name}</h3>
          <Badge tone={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'active' : 'inactive'}</Badge>
        </div>
        <p className="mt-1 text-sm font-bold text-brand">{formatNaira(p.price_naira)}</p>
        <p className="mt-2 line-clamp-2 text-xs text-stone-500">{p.description}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link to={`/products/${p.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Edit
            </Button>
          </Link>
          <Button variant="danger" className="w-full sm:w-auto" onClick={() => onDelete(p.id)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ProductListRow({ product: p, onDelete }: { product: Product; onDelete: (id: number) => void }) {
  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      {p.image_url ? (
        <img src={p.image_url} alt={p.name} className="h-24 w-full shrink-0 object-cover sm:h-20 sm:w-28" />
      ) : (
        <div className="flex h-24 w-full shrink-0 items-center justify-center bg-cream text-sm font-bold text-brand sm:h-20 sm:w-28">
          No image
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-stone-900">{p.name}</h3>
          <Badge tone={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'active' : 'inactive'}</Badge>
        </div>
        <p className="mt-1 text-sm font-bold text-brand">{formatNaira(p.price_naira)}</p>
        <p className="mt-1 line-clamp-1 text-xs text-stone-500">{p.description}</p>
      </div>
      <div className="flex shrink-0 gap-2 sm:flex-col">
        <Link to={`/products/${p.id}`}>
          <Button variant="outline" className="w-full min-w-[88px]">
            Edit
          </Button>
        </Link>
        <Button variant="danger" onClick={() => onDelete(p.id)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
