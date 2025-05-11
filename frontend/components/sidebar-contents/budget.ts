export const Menu = [
    {
      title: "Dashboard",
      items: [{ title: "Overview", url: "/pages/budget" }],
    },
    {
      title: "Material Requisition",
      items: [
        { title: "Restocking Requests", url: "/pages/budget/restocking-requests" },
        { title: "Restocking Requests History", url: "/pages/budget/requests-history" },
      ],
    },
    {
      title: "Purchase Management",
      items: [
        { title: "Purchase Orders", url: "/pages/budget/create-po" },
        { title: "Purchase Returns", url: "/pages/budget/create-po" },
        { title: "PO History", url: "/pages/budget/po-history" },
      ],
    },
  ];