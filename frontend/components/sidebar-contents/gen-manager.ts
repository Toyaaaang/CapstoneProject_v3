export const Menu = [
    {
      title: "Dashboard",
      items: [{ title: "Overview", url: "/pages/gen-manager" }],
    },
    {
      title: "Role Management",
      items: [
        { title: "Role Requests", url: "/pages/gen-manager/role-requests" },
        { title: "Approval History", url: "/pages/gen-manager/role-history" },
      ],
    },
    {
      title: "Inventory",
      items: [
        { title: "Stock Management", url: "/pages/gen-manager/stock" },
      ],
    },
    {
      title: "Approval Management",
      items: [
        { title: "Requisition Vouchers", url: "/pages/gen-manager/requisition-vouchers" },
        { title: "Purchase Orders", url: "/pages/gen-manager/purchase-orders" },
        { title: "Material Certifications", url: "/pages/gen-manager/certifications" },
        { title: "Material Requests", url: "/pages/gen-manager/requests" },

      ],
    },
    {
      title: "Accountability Management",
      items: [
        { title: "Accountabilities", url: "/pages/gen-manager/accountabilities" },
      ],
    },
  ];