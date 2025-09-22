"use client";
import React from 'react';
import ItemDescription from '@/components/pages/item-description/page';

interface PageProps { params: { id: string } }

export default function Page({ params }: PageProps) {
  return <ItemDescription id={params.id} />;
}


