const AdminPlaceholder = ({
  title,
  description,
  bullets,
}) => (
  <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    <p className="mt-2 text-sm text-gray-600">{description}</p>

    <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-gray-700">
      {bullets.map((bullet) => (
        <li key={bullet}>{bullet}</li>
      ))}
    </ul>
  </section>
);

export default AdminPlaceholder;
