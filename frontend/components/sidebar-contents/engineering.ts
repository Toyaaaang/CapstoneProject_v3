export const Menu = [
    {
      title: "Dashboard",
      items: [{ title: "Overview", url: "/pages/admin" }],
    },
    {
      title: "Material Quality Management",
      items: [
        { title: "Quality Compliance", url: "/pages/engineering/quality-check" },
        { title: "Quality Compliance History", url: "/pages/engineering/quality-history" },
      ],
    },
    {
      title: "Certification Management",
      items: [
        { title: "Certifications", url: "/pages/engineering/certificates" },
        { title: "Track Certifications", url: "/pages/engineering/track-certificates" },

      ],
    },
    {
      title: "Requests Management",
      items: [
        { title: "Pending Requests", url: "/pages/engineering/material-requests" },
        { title: "Requests History", url: "/pages/engineering/evaluation-history" },

      ],
    },
    {
      title: "Restocking Management",
      items: [
        { title: "Requisition Voucher", url: "/pages/engineering/restocking-requests" },
        { title: "Restocking History", url: "/pages/engineering/requests-history" },
      ],
    },
    {
      title: "Accountability Management",
      items: [
        { title: "Accountabilities", url: "/pages/engineering/accountability" },
      ],
    },
  ];