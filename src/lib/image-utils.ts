/**
 * Calculate progress statistics for a collection of images
 */
export function getProgressStats(images: any[]) {
  const total = images.length;
  const annotated = images.filter(
    (img) => img.annotationStatus === "ANNOTATED"
  ).length;
  const flagged = images.filter(
    (img) => img.annotationStatus === "FLAGGED"
  ).length;
  const unannotated = total - annotated - flagged;
  const completedPercent =
    total > 0 ? Math.round(((annotated + flagged) / total) * 100) : 0;

  return { completedPercent, annotated, flagged, unannotated, total };
}
