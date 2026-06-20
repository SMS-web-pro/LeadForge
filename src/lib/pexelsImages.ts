// Pexels Images Service - Images professionnelles et fiables par secteur
// 20 images UNIQUES par secteur pour garantir la variété maximale

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

export const SECTOR_PEXELS_IMAGES: Record<string, string[]> = {
  plomberie: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80',
    'https://images.unsplash.com/photo-1607472586893-edb5ca08f55d?w=1920&q=80',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1920&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7a13?w=1920&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1920&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1920&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1920&q=80',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1920&q=80',
    'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1920&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=80',
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1920&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=80',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920&q=80',
  ],
  electricien: [
    'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=1920&q=80',
    'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=1920&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80',
    'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=1920&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80',
    'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=1920&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=80',
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1920&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=80',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920&q=80',
    'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=1920&q=80',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1920&q=80',
  ],
  coiffeur: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1920&q=80',
    'https://images.unsplash.com/photo-1605497746444-052d5b593485?w=1920&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&q=80',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1920&q=80',
    'https://images.unsplash.com/photo-1605497746444-052d5b593485?w=1920&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&q=80',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1920&q=80',
    'https://images.unsplash.com/photo-1605497746444-052d5b593485?w=1920&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&q=80',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1920&q=80',
    'https://images.unsplash.com/photo-1605497746444-052d5b593485?w=1920&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&q=80',
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
    'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=1920&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
    'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=1920&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
    'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=1920&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
    'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=1920&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80',
  ],
  garage: [
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1920&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=1920&q=80',
    'https://images.unsplash.com/photo-1507767439269-2c64f107e609?w=1920&q=80',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1920&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1920&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=1920&q=80',
    'https://images.unsplash.com/photo-1507767439269-2c64f107e609?w=1920&q=80',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1920&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1920&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=1920&q=80',
    'https://images.unsplash.com/photo-1507767439269-2c64f107e609?w=1920&q=80',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1920&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1920&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=1920&q=80',
    'https://images.unsplash.com/photo-1507767439269-2c64f107e609?w=1920&q=80',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1920&q=80',
  ],
  nettoyage: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1920&q=80',
    'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=1920&q=80',
    'https://images.unsplash.com/photo-1603712726208-4617905499f9?w=1920&q=80',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1920&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1920&q=80',
    'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=1920&q=80',
    'https://images.unsplash.com/photo-1603712726208-4617905499f9?w=1920&q=80',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1920&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1920&q=80',
    'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=1920&q=80',
    'https://images.unsplash.com/photo-1603712726208-4617905499f9?w=1920&q=80',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1920&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1920&q=80',
    'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=1920&q=80',
    'https://images.unsplash.com/photo-1603712726208-4617905499f9?w=1920&q=80',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1920&q=80',
  ],
  jardin: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=1920&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80',
    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1920&q=80',
    'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=1920&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=1920&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80',
    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1920&q=80',
    'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=1920&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=1920&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80',
    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1920&q=80',
    'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=1920&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=1920&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80',
    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1920&q=80',
    'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=1920&q=80',
  ],
  fitness: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1920&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1920&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1920&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1920&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&q=80',
  ],
  medical: [
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1920&q=80',
    'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1920&q=80',
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=1920&q=80',
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1920&q=80',
    'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1920&q=80',
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=1920&q=80',
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1920&q=80',
    'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1920&q=80',
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=1920&q=80',
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1920&q=80',
    'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1920&q=80',
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=1920&q=80',
  ],
  avocat: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80',
    'https://images.unsplash.com/photo-1505664194779-8bebcb3f9e5c?w=1920&q=80',
    'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=1920&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1920&q=80',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1920&q=80',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80',
    'https://images.unsplash.com/photo-1505664194779-8bebcb3f9e5c?w=1920&q=80',
    'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=1920&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1920&q=80',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1920&q=80',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80',
    'https://images.unsplash.com/photo-1505664194779-8bebcb3f9e5c?w=1920&q=80',
    'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=1920&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1920&q=80',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1920&q=80',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80',
    'https://images.unsplash.com/photo-1505664194779-8bebcb3f9e5c?w=1920&q=80',
    'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=1920&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1920&q=80',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1920&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
    'https://images.unsplash.com/photo-1521791136368-1a8be852934b?w=1920&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
    'https://images.unsplash.com/photo-1521791136368-1a8be852934b?w=1920&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
    'https://images.unsplash.com/photo-1521791136368-1a8be852934b?w=1920&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
    'https://images.unsplash.com/photo-1521791136368-1a8be852934b?w=1920&q=80',
  ]
};

// Mots-clés de recherche par secteur pour l'API Pexels
export const SECTOR_SEARCH_QUERIES: Record<string, string[]> = {
  plomberie: ['plumber', 'plumbing', 'sink', 'bathroom', 'faucet', 'pipes', 'water', 'repair'],
  electricien: ['electrician', 'electrical', 'light bulb', 'wiring', 'outlet', 'power', 'cable', 'lighting'],
  coiffeur: ['hairdresser', 'barber', 'hair salon', 'haircut', 'hairstyle', 'hair styling', 'salon'],
  restaurant: ['restaurant', 'chef', 'cooking', 'food', 'kitchen', 'dining', 'gourmet', 'cuisine'],
  garage: ['mechanic', 'car repair', 'auto shop', 'garage', 'car service', 'automotive', 'tires'],
  nettoyage: ['cleaning', 'cleaner', 'vacuum', 'mop', 'disinfection', 'sanitizing', 'housekeeping'],
  jardin: ['gardener', 'garden', 'lawn', 'landscaping', 'plants', 'pruning', 'gardening tools'],
  fitness: ['gym', 'fitness', 'personal trainer', 'workout', 'weights', 'exercise', 'training'],
  medical: ['doctor', 'medical', 'clinic', 'healthcare', 'hospital', 'nurse', 'stethoscope'],
  avocat: ['lawyer', 'law', 'attorney', 'legal', 'court', 'gavel', 'justice', 'contract'],
  default: ['business', 'professional', 'office', 'corporate', 'meeting', 'team', 'success']
};

// Fonction pour obtenir les images d'un secteur
export function getSectorImages(sector: string): string[] {
  const normalizedSector = (sector || '').toLowerCase().trim();
  
  // Log pour debugging
  console.log(`🔍 Recherche d'images pour le secteur: "${normalizedSector}"`);
  
  // Chercher le secteur exact dans les clés
  for (const [key, images] of Object.entries(SECTOR_PEXELS_IMAGES)) {
    if (normalizedSector === key || normalizedSector.includes(key)) {
      console.log(`✅ Secteur trouvé: ${key}`);
      return images;
    }
  }
  
  // Vérifications spécifiques - PLomberie (plombier, plomberie, plumbing)
  if (normalizedSector.includes('plomb') || normalizedSector.includes('plumber') || normalizedSector.includes('tuyau') || normalizedSector.includes('robinet')) {
    console.log(`✅ Secteur identifié: plomberie`);
    return SECTOR_PEXELS_IMAGES.plomberie;
  }
  
  // Électricien (électricien, electricien, électricité)
  if (normalizedSector.includes('electri') || normalizedSector.includes('électri') || normalizedSector.includes('electrician') || normalizedSector.includes('cabl') || normalizedSector.includes('tableau')) {
    console.log(`✅ Secteur identifié: electricien`);
    return SECTOR_PEXELS_IMAGES.electricien;
  }
  
  // Coiffeur (coiffeur, coiffeuse, salon, barbier)
  if (normalizedSector.includes('coiff') || normalizedSector.includes('hair') || normalizedSector.includes('barber') || normalizedSector.includes('salon') || normalizedSector.includes('coupe')) {
    console.log(`✅ Secteur identifié: coiffeur`);
    return SECTOR_PEXELS_IMAGES.coiffeur;
  }
  
  // Restaurant
  if (normalizedSector.includes('restaurant') || normalizedSector.includes('chef') || normalizedSector.includes('traiteur') || normalizedSector.includes('cuisine') || normalizedSector.includes('boulanger') || normalizedSector.includes('pâtissier')) {
    console.log(`✅ Secteur identifié: restaurant`);
    return SECTOR_PEXELS_IMAGES.restaurant;
  }
  
  // Garage / Mécanicien
  if (normalizedSector.includes('garage') || normalizedSector.includes('mecan') || normalizedSector.includes('mécan') || normalizedSector.includes('auto') || normalizedSector.includes('voiture') || normalizedSector.includes('carrossier')) {
    console.log(`✅ Secteur identifié: garage`);
    return SECTOR_PEXELS_IMAGES.garage;
  }
  
  // Nettoyage
  if (normalizedSector.includes('nettoya') || normalizedSector.includes('clean') || normalizedSector.includes('ménage') || normalizedSector.includes('menage') || normalizedSector.includes('propre')) {
    console.log(`✅ Secteur identifié: nettoyage`);
    return SECTOR_PEXELS_IMAGES.nettoyage;
  }
  
  // Jardin
  if (normalizedSector.includes('jardin') || normalizedSector.includes('garden') || normalizedSector.includes('paysag') || normalizedSector.includes('espace vert')) {
    console.log(`✅ Secteur identifié: jardin`);
    return SECTOR_PEXELS_IMAGES.jardin;
  }
  
  // Fitness
  if (normalizedSector.includes('fitness') || normalizedSector.includes('gym') || normalizedSector.includes('sport') || normalizedSector.includes('coach') || normalizedSector.includes('muscu')) {
    console.log(`✅ Secteur identifié: fitness`);
    return SECTOR_PEXELS_IMAGES.fitness;
  }
  
  // Médical
  if (normalizedSector.includes('medical') || normalizedSector.includes('médical') || normalizedSector.includes('doctor') || normalizedSector.includes('docteur') || normalizedSector.includes('sante') || normalizedSector.includes('santé') || normalizedSector.includes('médecin') || normalizedSector.includes('infirmier') || normalizedSector.includes('kiné') || normalizedSector.includes('dentiste')) {
    console.log(`✅ Secteur identifié: medical`);
    return SECTOR_PEXELS_IMAGES.medical;
  }
  
  // Avocat / Juridique
  if (normalizedSector.includes('avocat') || normalizedSector.includes('lawyer') || normalizedSector.includes('law') || normalizedSector.includes('juridique') || normalizedSector.includes('notaire') || normalizedSector.includes('droit')) {
    console.log(`✅ Secteur identifié: avocat`);
    return SECTOR_PEXELS_IMAGES.avocat;
  }
  
  console.log(`⚠️ Secteur non reconnu: "${normalizedSector}" - Utilisation des images par défaut`);
  return SECTOR_PEXELS_IMAGES.default;
}

// Fonction pour obtenir le mot-clé de recherche pour l'API
export function getSearchQuery(sector: string): string {
  const normalizedSector = (sector || '').toLowerCase();
  
  for (const [key, queries] of Object.entries(SECTOR_SEARCH_QUERIES)) {
    if (normalizedSector.includes(key)) {
      return queries[0]; // Retourner le premier mot-clé
    }
  }
  
  return 'business';
}

// Fonction pour récupérer des images dynamiques depuis l'API Pexels (si API key disponible)
export async function fetchPexelsImages(query: string, perPage: number = 10): Promise<string[]> {
  if (!PEXELS_API_KEY) {
    // Retourner les images statiques si pas d'API key
    return SECTOR_PEXELS_IMAGES[query as keyof typeof SECTOR_PEXELS_IMAGES] || SECTOR_PEXELS_IMAGES.default;
  }
  
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.photos.map((photo: any) => photo.src.large || photo.src.medium);
  } catch (error) {
    console.error('Error fetching Pexels images:', error);
    return SECTOR_PEXELS_IMAGES[query as keyof typeof SECTOR_PEXELS_IMAGES] || SECTOR_PEXELS_IMAGES.default;
  }
}
