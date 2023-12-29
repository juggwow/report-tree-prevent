import fs from 'fs';
const turf = require('@turf/turf');
const utmObj = require('utm-latlng');

const shapefileData = JSON.parse(fs.readFileSync('AOJ.json', 'utf8'));
const utm = new utmObj();

// const businessNameMap = new Map([
//   [12010,{businessName: "กฟจ.ยะลา", fullName: "การไฟฟ้าส่วนภูมิภาคจังหวัดยะลา"}],
//   [12011,{businessName: "กฟส.บันนังสตา", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอบันนังสตา"}],
//   [12011,{businessName: "กฟส.บันนังสตา", fullName: "การไฟฟ้าส่วนภูมิภาคสาขาอำเภอบันนังสตา"}],
// ])

export function findAOJ(lat: number, lon: number): null | string {
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
                  return subAOJS.properties.CODE.toString();
                }
            }
        }
        else{
            
            const area = turf.polygon(aojs.geometry.coordinates);
            const containingArea = turf.booleanPointInPolygon(targetPoint, area);
            if(containingArea){
              return aojs.properties.CODE.toString();
            }
        }
    } catch (e) {}
  }

  return null;
}