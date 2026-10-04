'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PosterEditor from '@/components/poster/PosterEditor';

function Inner({ id }) {
  const sp = useSearchParams();
  return <PosterEditor id={id} templateSlug={sp.get('template')} formatKey={sp.get('format')} resume={sp.get('resume') === '1'} copy={sp.get('copy') === '1'} />;
}

export default function PosterEditorPage({ params }) {
  return (
    <Suspense>
      <Inner id={params.id} />
    </Suspense>
  );
}
