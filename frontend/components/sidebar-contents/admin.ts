export const warehouseAdminMenu = [
    {
      title: "Dashboard",
      items: [{ title: "Overview", url: "/pages/admin" }],
    },
    {
      title: "Role Management",
      items: [
        { title: "Role Requests", url: "/pages/admin/role-requests" },
        { title: "Approval History", url: "/pages/admin/role-history" },
      ],
    },
    {
      title: "Inventory",
      items: [
        { title: "Stock Management", url: "/pages/admin/stock" },
      ],
    },
    {
      title: "Approval Management",
      items: [
        { title: "Material Certifications", url: "/pages/admin/certifications" },
        { title: "Charge Tickets", url: "/pages/admin/charge-tickets" },
        { title: "Receiving Reports", url: "/pages/admin/receiving-reports" },
        { title: "Salvage Tickets", url: "/pages/admin/salvage-tickets" },
        { title: "Credit Tickets", url: "/pages/admin/credit-tickets" },




      ],
    },
    {
      title: "Accountability Management",
      items: [
        { title: "Accountabilities", url: "/pages/admin/accountability-management" },
      ],
    },
  ];