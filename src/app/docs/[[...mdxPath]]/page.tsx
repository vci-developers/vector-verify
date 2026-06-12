import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { useMDXComponents as getMDXComponents } from '../../../../mdx-components';
import type { FC, ReactNode } from 'react';

export const generateStaticParams = generateStaticParamsFor('mdxPath');

const { wrapper: Wrapper } = getMDXComponents({}) as {
    wrapper: FC<{ toc: unknown; metadata: unknown; children: ReactNode }>;
};

export async function generateMetadata(props: {
    params: Promise<{ mdxPath?: string[] }>;
}) {
    const params = await props.params;
    const { metadata } = await importPage(params.mdxPath);
    return metadata;
}

export default async function Page(props: {
    params: Promise<{ mdxPath?: string[] }>;
}) {
    const params = await props.params;
    const result = await importPage(params.mdxPath);
    const { default: MDXContent, toc, metadata } = result;

    return (
        <Wrapper toc={toc} metadata={metadata}>
            <MDXContent {...props} params={params} />
        </Wrapper>
    );
}
