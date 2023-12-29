import AOJ from '@/src/AOJ';
const turf = require('@turf/turf');
const utmObj = require('utm-latlng');

const shapefileData = JSON.parse(AOJ);
const utm = new utmObj();

const businessNameMap = new Map([
  ["12011",{businessName: "กฟจ.ยะลา", fullName: "การไฟฟ้าส่วนภูมิภาคจังหวัดยะลา"}],
  ["12012",{businessName: "กฟส.บันนังสตา", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอบันนังสตา"}],
  ["12013",{businessName: "กฟส.รามัน", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอรามัน"}],
  ["12021",{businessName: "กฟจ.นราธิวาส", fullName: "การไฟฟ้าส่วนภูมิภาคจังหวัดนราธิวาส"}],
  ["12022",{businessName: "กฟส.ระแงะ", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอระแงะ"}],
  ["12023",{businessName: "กฟส.รือเสาะ", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอรือเสาะ"}],
  ["12024",{businessName: "กฟส.ตากใบ", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอตากใบ"}],
  ["12031",{businessName: "กฟจ.ปัตตานี", fullName: "การไฟฟ้าส่วนภูมิภาคจังหวัดปัตตานี"}],
  ["12032",{businessName: "กฟส.โคกโพธิ์", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอโคกโพธิ์"}],
  ["12033",{businessName: "กฟส.หนองจิก", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอหนองจิก"}],
  ["12041",{businessName: "กฟส.สงขลา", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาเมืองสงขลา"}],
  ["12042",{businessName: "กฟส.สิงหนคร", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาสิงหนคร"}],
  ["12051",{businessName: "กฟจ.สตูล", fullName: "การไฟฟ้าส่วนภูมิภาคจังหวัดสตูล"}],
  ["12052",{businessName: "กฟส.ละงู", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอละงู"}],
  ["12053",{businessName: "กฟส.ควนกาหลง", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอควนกาหลง"}],
  ["12061",{businessName: "กฟจ.พัทลุง", fullName: "การไฟฟ้าส่วนภูมิภาคจังหวัดพัทลุง"}],
  ["12062",{businessName: "กฟส.ตะโหมด", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอตะโหมด"}],
  ["12063",{businessName: "กฟส.ควนขนุน", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอควนขนุน"}],
  ["12064",{businessName: "กฟส.ปากพะยูน", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอปากพะยูน"}],
  ["12071",{businessName: "กฟส.หาดใหญ่", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาหาดใหญ่"}],
  ["12072",{businessName: "กฟส.รัตภูมิ", fullName: "การไฟฟ้าส่วนภูมิภาคสาขารัตภูมิ"}],
  ["12073",{businessName: "กฟส.นาหม่อม", fullName: "การไฟฟ้าส่วนภูมิภาคสาขานาหม่อม"}],
  ["12081",{businessName: "กฟอ.สุไหงโกลก", fullName: "การไฟฟ้าส่วนภูมิภาคอำเภอสุไหงโก-ลก"}],
  ["12091",{businessName: "กฟอ.เบตง", fullName: "การไฟฟ้าส่วนภูมิภาคอำเภอเบตง"}],
  ["12101",{businessName: "กฟอ.สายบุรี", fullName: "การไฟฟ้าส่วนภูมิภาคอำเภอสายบุรี"}],
  ["12102",{businessName: "กฟส.มายอ", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอมายอ"}],
  ["12111",{businessName: "กฟส.ระโนด", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาระโนด"}],
  ["12112",{businessName: "กฟส.สทิงพระ", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาสทิงพระ"}],
  ["12121",{businessName: "กฟส.สะเดา", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาสะเดา"}],
  ["12122",{businessName: "กฟส.พังลา", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาพังลา"}],
  ["12131",{businessName: "กฟส.จะนะ", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาจะนะ"}],
  ["12132",{businessName: "กฟส.นาทวี", fullName: "การไฟฟ้าส่วนภูมิภาคสาขานาทวี"}],
  ["12133",{businessName: "กฟส.สะบ้าย้อย", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาสะบ้าย้อย"}],
  ["12134",{businessName: "กฟส.เทพา", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาเทพา"}],
])

export function findAOJ(lat: number, lon: number): undefined | null | {businessName: string, fullName: string} {
  const myUTM = utm.convertLatLngToUtm(lat, lon, 1);

  const targetPoint = turf.point([myUTM.Easting, myUTM.Northing]);

  for (const aojs of shapefileData.features) {
    try {
      if(aojs.geometry.coordinates.length>1)
        {
            for (const subAOJS of aojs.geometry.coordinates){
                const area = turf.polygon(subAOJS)
                const containArea = turf.booleanPointInPolygon(targetPoint, area)
                if(containArea){
                  return businessNameMap.get(subAOJS.properties.CODE.toString().slice(0,5));
                }
            }
        }
        else{
            const area = turf.polygon(aojs.geometry.coordinates);
            const containingArea = turf.booleanPointInPolygon(targetPoint, area);
            if(containingArea){
              return businessNameMap.get(aojs.properties.CODE.toString().slice(0,5));
            }
        }
    } catch (e) {}
  }

  return null;
}