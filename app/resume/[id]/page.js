'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResumeBuilder from '@/components/resume/ResumeBuilder';

function Inner({ id }) {
  const sp = useSearchParams();
  return <ResumeBuilder id={id} templateSlug={sp.get('template')} resume={sp.get('resume') === '1'} />;
}

export default function ResumeBuilderPage({ params }) {
  return (
    <Suspense>
      <Inner id={params.id} />
    </Suspense>
  );
}
