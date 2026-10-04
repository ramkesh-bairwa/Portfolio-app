'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Builder from '@/components/builder/Builder';

function Inner({ id }) {
  const sp = useSearchParams();
  return <Builder id={id} templateSlug={sp.get('template')} resume={sp.get('resume') === '1'} />;
}

export default function BuilderPage({ params }) {
  return (
    <Suspense>
      <Inner id={params.id} />
    </Suspense>
  );
}
