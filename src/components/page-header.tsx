interface PageHeaderProps {
    title: string;
    description: string;
    actions?: React.ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="font-headline text-3xl md:text-4xl font-bold text-white">{title}</h1>
                <p className="mt-2 text-lg text-muted-foreground">{description}</p>
            </div>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
    );
}
