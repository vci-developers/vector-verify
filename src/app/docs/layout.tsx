import 'nextra-theme-docs/style.css';
import { Layout, Navbar } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import type { ReactNode } from 'react';

export default async function DocsLayout({
    children,
}: {
    children: ReactNode;
}) {
    const pageMap = await getPageMap();

    return (
        <Layout
            navbar={
                <Navbar
                    logo={
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                            VectorVerify Docs
                        </span>
                    }
                />
            }
            pageMap={pageMap}
            docsRepositoryBase="https://github.com/vci-developers/vector-verify/tree/main"
            footer={<></>}
        >
            {children}
        </Layout>
    );
}
