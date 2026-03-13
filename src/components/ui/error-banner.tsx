interface ErrorBannerProps {
    errorMessage: string;
}

export default function ErrorBanner({ errorMessage }: ErrorBannerProps) {
    return (
        <div
            role="alert"
            className="bg-destructive/10 text-destructive rounded-md p-4 text-sm"
        >
            {errorMessage}
        </div>
    );
}
