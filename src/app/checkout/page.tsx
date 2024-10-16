
import React from 'react';
import CheckoutClient from '@/components/CheckoutClient';
import Head from 'next/head';

type PageProps = {
  searchParams: {
    id?: string;
  };
};

// **Declare the page as dynamic**
export const dynamic = 'force-dynamic';

const CheckoutPage: React.FC<PageProps> = ({ searchParams }) => {
  const { id } = searchParams;

  return (
    <>
      <Head>
        <title>Checkout - Aptos Biodiversity Marketplace</title>
        <meta name="description" content="Complete your purchase on the Aptos Biodiversity Marketplace." />
      </Head>
      <CheckoutClient projectId={id} />
    </>
  );
};

export default CheckoutPage;