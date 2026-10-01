import { PhotographerProfile } from '../types';

/**
 * Curated 15-photo galleries for each specialization category.
 * - Photographer Card Preview uses the first 6 photos.
 * - Full Category Showcase Modal displays all 15 photos across 5 clean rows (3 photos per row).
 */
export const CATEGORY_DEFAULT_GALLERIES: Record<string, string[]> = {
  'Fashion Shoot': [
    // 1-6 (Unchanged, exact preview photos)
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&auto=format&fit=crop&q=85',
    // 7-15 (Extended 9 photos to complete 15 photos in 5 rows)
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&auto=format&fit=crop&q=85',
  ],
  'Fashion': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&auto=format&fit=crop&q=85',
  ],
  'Jewellery Shoot': [
    // 1-6 (Unchanged, exact preview photos)
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1611591475825-961a666e5114?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&auto=format&fit=crop&q=85',
    // 7-15
    'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=900&auto=format&fit=crop&q=85',
  ],
  'Jewellery': [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1611591475825-961a666e5114?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=900&auto=format&fit=crop&q=85',
  ],
  'Jewelry': [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1611591475825-961a666e5114?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=900&auto=format&fit=crop&q=85',
  ],
  'Commercial Shoot': [
    // 1-6 (Unchanged, exact preview photos)
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop&q=85',
    // 7-15
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop&q=85',
  ],
  'Commercial': [
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop&q=85',
  ],
  'One Day Shoot': [
    // 1-6 (Unchanged, exact preview photos)
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1502982720700-befe977a084d?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&auto=format&fit=crop&q=85',
    // 7-15
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=85',
  ],
  'Product Shoot': [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1503602642458-232111445657?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&auto=format&fit=crop&q=85',
  ],
  'F&B Shoot': [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1484723091739-0045614eb990?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=900&auto=format&fit=crop&q=85',
  ],
  'Restaurant & Cafe Shoot': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1508766917616-d22f3f1eea14?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1445116572660-238c322700f5?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop&q=85',
  ],
  'Interior Shoot': [
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1615873968403-89e068629265?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=85',
  ],
  'Hotel Shoot': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&auto=format&fit=crop&q=85',
  ],
  'Other / Custom Requirement': [
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=900&auto=format&fit=crop&q=85',
  ],
  'Other / Custom': [
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=900&auto=format&fit=crop&q=85',
  ],
};

/**
 * Normalizes category variations (e.g. 'Fashion' -> 'Fashion Shoot', 'Jewelry' -> 'Jewellery Shoot')
 */
export function normalizeCategoryKey(cat: string): string {
  const trimmed = cat.trim();
  if (/^fashion/i.test(trimmed)) return 'Fashion Shoot';
  if (/^jewel/i.test(trimmed)) return 'Jewellery Shoot';
  if (/^commercial/i.test(trimmed)) return 'Commercial Shoot';
  if (/^one day/i.test(trimmed)) return 'One Day Shoot';
  if (/^product/i.test(trimmed)) return 'Product Shoot';
  if (/^f&b/i.test(trimmed)) return 'F&B Shoot';
  if (/^restaurant|^cafe/i.test(trimmed)) return 'Restaurant & Cafe Shoot';
  if (/^interior/i.test(trimmed)) return 'Interior Shoot';
  if (/^hotel/i.test(trimmed)) return 'Hotel Shoot';
  if (/^other.*custom/i.test(trimmed)) return 'Other / Custom';
  return trimmed;
}

/**
 * Returns photos for a given category and photographer.
 * - If count is 6: returns the first 6 photos (for card preview strip).
 * - If count is 15: returns 15 photos (for full modal showcase in 5 rows).
 */
export function getCategoryPhotos(
  photographer: PhotographerProfile | null | undefined,
  categoryName: string,
  count: number = 15
): string[] {
  const normalized = normalizeCategoryKey(categoryName);
  const defaults = CATEGORY_DEFAULT_GALLERIES[normalized] ||
    CATEGORY_DEFAULT_GALLERIES[categoryName] ||
    CATEGORY_DEFAULT_GALLERIES['Commercial Shoot'];

  // Check photographer's custom category gallery
  const custom = photographer?.categoryGalleries?.[categoryName] ||
    photographer?.categoryGalleries?.[normalized];

  if (custom && Array.isArray(custom)) {
    const list = custom.filter(Boolean);
    if (list.length > 0) {
      return list.slice(0, count);
    }
  }

  const list = [...defaults];
  while (list.length < count) {
    list.push(defaults[list.length % defaults.length]);
  }
  return list.slice(0, count);
}
