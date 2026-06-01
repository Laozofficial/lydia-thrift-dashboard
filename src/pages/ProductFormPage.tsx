import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { createProduct, getProduct, updateProduct, uploadProductImage } from '../api/admin';
import { ApiError, formatFieldErrors } from '../api/client';
import { Alert, Button, Card, Input, Label, PageHeader, Textarea } from '../components/ui';

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [priceNaira, setPriceNaira] = useState('');
  const [daily, setDaily] = useState('30');
  const [weekly, setWeekly] = useState('4');
  const [monthly, setMonthly] = useState('3');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    getProduct(Number(id))
      .then((p) => {
        setName(p.name);
        setSlug(p.slug);
        setDescription(p.description ?? '');
        setImageUrl(p.image_url ?? '');
        setPreview(p.image_url);
        setPriceNaira(String(p.price_naira));
        setDaily(String(p.installment_count_daily));
        setWeekly(String(p.installment_count_weekly));
        setMonthly(String(p.installment_count_monthly));
        setIsActive(p.is_active);
      })
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body = {
      name,
      slug: slug || undefined,
      description: description || null,
      image_url: imageUrl || null,
      price_naira: parseFloat(priceNaira),
      installment_count_daily: parseInt(daily, 10),
      installment_count_weekly: parseInt(weekly, 10),
      installment_count_monthly: parseInt(monthly, 10),
      is_active: isActive,
    };

    try {
      let productId: number;
      if (isNew) {
        const created = await createProduct(body);
        productId = created.id;
      } else {
        const updated = await updateProduct(Number(id), body);
        productId = updated.id;
      }
      if (imageFile) await uploadProductImage(productId, imageFile);
      navigate('/products');
    } catch (err) {
      if (err instanceof ApiError) setError(formatFieldErrors(err.errors) || err.message);
      else setError('Could not save product.');
    }
  }

  if (loading) return <p className="text-stone-500">Loading…</p>;

  return (
    <div>
      <PageHeader
        title={isNew ? 'Add product' : 'Edit product'}
        action={
          <Link to="/products" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Back
            </Button>
          </Link>
        }
      />
      <Card className="w-full max-w-2xl p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <Alert>{error}</Alert> : null}
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name if empty" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Price (₦)</Label>
            <Input type="number" min="0.01" step="0.01" value={priceNaira} onChange={(e) => setPriceNaira(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label>Daily installments</Label>
              <Input type="number" min="1" value={daily} onChange={(e) => setDaily(e.target.value)} required />
            </div>
            <div>
              <Label>Weekly installments</Label>
              <Input type="number" min="1" value={weekly} onChange={(e) => setWeekly(e.target.value)} required />
            </div>
            <div>
              <Label>Monthly installments</Label>
              <Input type="number" min="1" value={monthly} onChange={(e) => setMonthly(e.target.value)} required />
            </div>
          </div>
          <div>
            <Label>Image URL (optional)</Label>
            <Input value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setPreview(e.target.value); }} placeholder="https://…" />
          </div>
          <div>
            <Label>Upload image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
            {preview ? <img src={preview} alt="Preview" className="mt-3 h-48 w-full border border-stone-200 object-cover" /> : null}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active in shop
          </label>
          <Button type="submit" className="w-full sm:w-auto">
            {isNew ? 'Create product' : 'Save changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
