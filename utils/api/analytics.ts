import { CategoryAnalyticsData } from "@/lib/types";

const API_BASE_URL = "http://localhost:8000/api/v1"

export async function getCategoryAnalytics(
  token: string,
  startDate: string,
  endDate: string,
  categoryIds?: number[]
): Promise<CategoryAnalyticsData[]> {
  const url = new URL(`${API_BASE_URL}/analytics/category-sums`);
  url.searchParams.append("start_date", startDate);
  url.searchParams.append("end_date", endDate);

  if (categoryIds && categoryIds.length > 0) {
    categoryIds.forEach(id => {
      url.searchParams.append("category_ids", id.toString());
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch category analytics");
  }

  return res.json();
}
