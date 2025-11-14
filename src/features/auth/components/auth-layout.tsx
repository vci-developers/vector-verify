import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  illustrationSrc: string;
  illustrationAlt: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  linkLabel: string;
  children: React.ReactNode;
}

export function AuthLayout({
  illustrationSrc,
  illustrationAlt,
  title,
  description,
  linkText,
  linkHref,
  linkLabel,
  children,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen md:grid-cols-[55%_45%]">
      <div
        className="relative hidden md:block"
        style={{
          background:
            'linear-gradient(to bottom, var(--auth-bg-gradient-top) 0%, var(--auth-bg-gradient-middle) 50%, var(--auth-bg-gradient-bottom) 100%)',
        }}
      >
        <Image
          src={illustrationSrc}
          alt={illustrationAlt}
          fill
          priority
          className="object-contain"
        />
        <div className="absolute top-10 left-10 z-10">
          <Image
            src="/assets/auth/images/logo.png"
            alt="VectorCam Logo"
            width={300}
            height={300}
            priority
            quality={100}
            className="h-auto w-14"
          />
        </div>
      </div>
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex justify-end p-6">
          <span className="text-muted-foreground text-sm">
            {linkText}{' '}
            <Link
              href={linkHref}
              className="cursor-pointer font-medium underline"
              style={{ color: 'var(--auth-link)' }}
            >
              {linkLabel}
            </Link>
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-[29.12rem] space-y-8">
            <div className="space-y-2">
              <h1 className="text-foreground text-3xl font-bold tracking-tight">
                {title}
              </h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
