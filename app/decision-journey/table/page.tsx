import TableExplorer from "./TableExplorer";

export const metadata = {
  title: "Versioned table explorer · tanjnx",
  description: "Filter actual locally published sample rows and inspect reproducible statistics.",
  openGraph: { title: "Versioned table explorer · tanjnx", description: "Local table version and query results.", images: [] },
  twitter: { title: "Versioned table explorer · tanjnx", description: "Local table version and query results.", images: [] },
};
export default function TablePage() { return <TableExplorer />; }
