export function triggerBrowserDownload(url: string): void {
    const anchor = document.createElement('a');
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
}
