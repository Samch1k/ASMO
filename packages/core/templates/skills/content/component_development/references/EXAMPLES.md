# Component Development - Examples

## Example: RatingWidget Component

**Wireframe**: 5-star rating UI with hover states

**Implementation**:
```tsx
export function RatingWidget({ value, onChange, readonly }: Props) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          disabled={readonly}
          className="text-2xl hover:scale-110 transition-transform"
          aria-label={`${star} stars`}
        >
          {star <= value ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}
```

**Tests**: 12 component tests + accessibility audit (100/100)
