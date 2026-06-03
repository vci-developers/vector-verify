import { useMDXComponents as getDocsComponents } from 'nextra-theme-docs';
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...getDocsComponents(),
        ...components,
    };
}
