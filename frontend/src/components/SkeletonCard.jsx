const SkeletonCard = () => (
  <div className="overflow-hidden rounded-xl bg-white shadow">
    <div className="skeleton h-48 w-full" />
    <div className="space-y-3 p-5">
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="flex items-center justify-between pt-2">
        <div className="skeleton h-5 w-20" />
        <div className="skeleton h-4 w-16" />
      </div>
      <div className="skeleton h-10 w-full rounded-lg" />
    </div>
  </div>
);

export default SkeletonCard;
