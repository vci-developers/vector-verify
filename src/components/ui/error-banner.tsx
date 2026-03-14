interface ErrorBannerProps {
    message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
    return (
        <div
            role="alert"
            className="bg-destructive/10 text-destructive rounded-md p-4 text-sm"
        >
            {message}
        </div>
    );
}
