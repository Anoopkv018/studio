
type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="text-center mb-8 md:mb-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">{title}</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}
