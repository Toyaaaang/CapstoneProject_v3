export function groupInventoryByMaterial(data) {
  const grouped = {}

  data.forEach(item => {
    const name = item.material_name
    const dept = item.department
    const quantity = parseFloat(item.quantity)

    if (!grouped[name]) {
      grouped[name] = { name }
    }
    grouped[name][dept] = quantity
  })

  return Object.values(grouped)
}
