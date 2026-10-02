export type ResearchSection = {
  heading: string;
  kind?: "Documented issue" | "Maintenance concern" | "Inspection point" | "Configuration";
  paragraphs: string[];
  sources: string[];
};

export type ResearchGuide = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  reviewed: string;
  status: "indexable";
  sections: ResearchSection[];
  links: { href: string; label: string; reason: string }[];
};

export const researchSources: Record<string, { title: string; url: string }> = {
  electrical: { title: "DVSA MOT manual: electrical wiring and batteries", url: "https://www.gov.uk/guidance/mot-inspection-manual-for-private-passenger-and-light-commercial-vehicles/4-lamps-reflectors-and-electrical-equipment" },
  aircon: { title: "AA: air-conditioning testing and regassing", url: "https://www.theaa.com/car-care/advice/servicing/guide-to-air-con-regassing" },
  power: { title: "RAC: causes of loss of power", url: "https://www.rac.co.uk/drive/advice/know-how/what-causes-a-loss-of-power-in-a-car/" },
  slipping: { title: "ZF Aftermarket: causes of clutch slip", url: "https://aftermarket.zf.com/en/aftermarket-portal/for-workshops/useful-tips/clutches/clutch-slipping/" },
  brakes: { title: "DVSA MOT manual: brakes", url: "https://www.gov.uk/guidance/mot-inspection-manual-for-private-passenger-and-light-commercial-vehicles/1-brakes" },
  steering: { title: "DVSA MOT manual: steering", url: "https://www.gov.uk/guidance/mot-inspection-manual-for-private-passenger-and-light-commercial-vehicles/2-steering" },
  suspension: { title: "DVSA MOT manual: axles, wheels, tyres and suspension", url: "https://www.gov.uk/guidance/mot-inspection-manual-for-private-passenger-and-light-commercial-vehicles/5-axles-wheels-tyres-and-suspension" },
  structure: { title: "DVSA MOT manual: body, structure and attachments", url: "https://www.gov.uk/guidance/mot-inspection-manual-for-private-passenger-and-light-commercial-vehicles/6-body-structure-and-attachments" },
  equipment: { title: "DVSA MOT manual: other equipment", url: "https://www.gov.uk/guidance/mot-inspection-manual-for-private-passenger-and-light-commercial-vehicles/7-other-equipment" },
  emissions: { title: "DVSA MOT manual: noise, emissions and fluid leaks", url: "https://www.gov.uk/guidance/mot-inspection-manual-for-private-passenger-and-light-commercial-vehicles/8-nuisance" },
  results: { title: "GOV.UK: understanding an MOT result", url: "https://www.gov.uk/getting-an-mot/after-the-test" },
  kodiaq: { title: "Škoda: second-generation Kodiaq powertrains", url: "https://www.skoda-storyboard.com/en/press-kits/skoda-kodiaq-press-kit/the-all-new-skoda-kodiaq-more-spacious-functional-and-sustainable-than-ever-before/" },
  skodaService: { title: "Škoda UK: servicing and maintenance", url: "https://www.skoda.co.uk/owners/servicing-maintenance-fixed-price" },
  skodaManual: { title: "Škoda UK: model-specific owner's manuals", url: "https://www.skoda.co.uk/owners/your-skoda" },
  superb: { title: "Škoda: original Superb iV plug-in hybrid", url: "https://www.skoda-storyboard.com/de/pressemappe/skoda-iv-pressemappe/skoda-superb-iv-start-in-ein-neues-zeitalter/" },
  bluehdi: { title: "Citroën UK: 1.5 BlueHDi camshaft-chain information", url: "https://www.citroen.co.uk/owners/citroen-1-5-diesel-engine-key-information.html" },
  puretech: { title: "Citroën UK: PureTech support conditions", url: "https://www.citroen.co.uk/content/dam/citroen/uk/b2c/maintain/Puretech-Message-V-2-2025.pdf" },
  defender: { title: "Land Rover: new Defender specification brochure", url: "https://www.landrover.co.uk/content/dam/lrdx/pdfs/uk/brochures/defender/L663_20MY_EBro_GE_V11_optimized_tcm295-799843.pdf" },
  evoque: { title: "JLR UK: Evoque plug-in hybrid introduction", url: "https://media.jlr.com/range-rover/en-gb/news/2020/04/evoque-and-discovery-sport-now-available-plug-hybrids-all-electric-range-34-miles" },
  vitara: { title: "Suzuki: full-hybrid Vitara and AGS transmission", url: "https://www.suzuki.nl/auto/nieuws/suzuki-introduceert-nieuwe-hybride-aandrijflijn/" },
  vitaraMild: { title: "Suzuki UK: Vitara mild-hybrid and ALLGRIP specification", url: "https://cars.suzuki.co.uk/new-cars/vitara/" },
  mazda2: { title: "Mazda UK: Mazda2 Hybrid introduction and Toyota collaboration", url: "https://uk.mazda-press.com/news/2022/mazda2-hybrid-uk-price-and-specification-announced/" },
  cx5oil: { title: "Mazda CX-5 handbook: engine-oil checks", url: "https://owners-manual.mazda.com/gen/en/cx-5/cx-5_8hy2ee19l/contents/07031600.html" },
  cx5dpf: { title: "Mazda CX-5 handbook: DPF warnings", url: "https://owners-manual.mazda.com/gen/en/cx-5/cx-5_8dw2eo14k/contents/05020424.html" },
  mazda6: { title: "Mazda6 handbook: oil grades and drivetrain fluids", url: "https://owners-manual.mazda.com/gen/en/mazda6/mazda6_8fk7ee16f/contents/10020101.html" },
  mazda6oil: { title: "Mazda6 handbook: maintenance and diesel oil-level checks", url: "https://owners-manual.mazda.com/gen/en/mazda6/mazda6_8hh3ee19c.pdf" },
  kona: { title: "DVSA: 2018 Kona EV battery safety recall", url: "https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/HYUNDAI/model/KONA%20EV/year/2018/recalls" },
  hyundaiRecall: { title: "Hyundai UK: recall and service-campaign checker", url: "https://recalls.hyundai.co.uk/" },
  micra: { title: "Nissan UK: 2019 Micra engines and Xtronic CVT", url: "https://uk.nissannews.com/en-GB/releases/more-micra-nissan-widens-powertrain-range-to-better-meet-customer-needs" },
  ibiza: { title: "DVSA: 2018 Ibiza rear-belt and handbrake recalls", url: "https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/SEAT/model/IBIZA/year/2018/recalls" },
  ibizaManual: { title: "SEAT Ibiza UK owner's manual", url: "https://www.seat.com/datamanual-manual/ibiza_sc/my18_w45/en-uk/IBIZA_11_17_EN.pdf" },
  honda: { title: "Honda UK: CR-V manuals by model year and powertrain", url: "https://www.honda.co.uk/cars/owners/manuals-and-guides/honda-owners-manuals.html" },
  stonic: { title: "Kia: 2020 Stonic mild-hybrid and iMT introduction", url: "https://prod2-press.kia.com/eu/en/home/media-resouces/press-releases/2020/Upgraded_Kia_Stonic.html" },
  tesla: { title: "Tesla Model 3: service and maintenance items", url: "https://service.tesla.com/docs/Public/diy/model3/en_us/GUID-A84FDD77-7A8C-42F6-9385-E3F9CEE245A4.html" },
  teslaRecall: { title: "Tesla: VIN-specific recall checker", url: "https://service.tesla.com/en-US/vin-recall-search?redirect=no" },
  glc: { title: "Mercedes-Benz GLC X253 owner's manual", url: "https://static.oneweb.mercedes-benz.com/css-oom-assets/en-lb/pdf/mercedes-glc-suv-2021-january-x253-mbux-owners-manual-1.pdf" },
  gla: { title: "Mercedes-Benz GLA X156 owner's manual", url: "https://static.oneweb.mercedes-benz.com/css-oom-assets/en-lb/pdf/mercedes-gla-suv-2018-march-x156-owners-manual-1.pdf" },
  eclass: { title: "Mercedes-Benz: E-Class manuals by generation", url: "https://www.mercedes-benz.co.uk/vans/services/manuals.html/e-class-saloon-2014-11-w212" },
  insignia: { title: "Vauxhall Insignia handbook: diesel exhaust-filter warnings", url: "https://www.vauxhall.co.uk/content/dam/vauxhall/Home/PDFs/owners/owners-manuals/insignia/om_insignia_kta-2675_13-vx-en_eu_my15_ed0814_38_en_vx_online.pdf" },
  judder: { title: "AA patrol guidance: car juddering", url: "https://www.theaa.com/breakdown-cover/advice/car-juddering" },
  noises: { title: "RAC: interpreting unusual vehicle noises", url: "https://www.rac.co.uk/drive/advice/know-how/guide-to-unusual-vehicle-noises/" },
  coolant: { title: "AA: checking coolant safely", url: "https://www.theaa.com/breakdown-cover/advice/how-to-check-your-engine-coolant" },
  overheating: { title: "Kia handbook: response to engine overheating", url: "https://ownersmanual.kia.com/docview/webhelp/doc/a8a8a615-c070-4a20-b08b-db5d0967b3a2/topics/chapter7_5.html" },
  battery: { title: "AA: flat-battery checks", url: "https://www.theaa.com/breakdown-cover/advice/flat-battery" },
  starting: { title: "AA: reasons a car will not start", url: "https://www.theaa.com/breakdown-cover/advice/starting-a-car" },
  clutch: { title: "RAC: test-drive inspection checklist", url: "https://www.rac.co.uk/pdfs/drive/test-drive-checklist.pdf" },
  dct: { title: "Kia handbook: dual-clutch temperature warnings", url: "https://ownersmanual.kia.com/full_webhelp/SP2/2022/en_GB/topics/chapter6_8_2.html" },
  suspensionAdvice: { title: "RAC: suspension symptoms and inspection", url: "https://www.rac.co.uk/car-care/car-repairs/suspension-repairs" },
  smoke: { title: "RAC: engine and exhaust smoke", url: "https://www.rac.co.uk/drive/advice/know-how/engine-smoking-why-its-happening-and-what-to-do/" },
  whiteSmoke: { title: "AA: white exhaust smoke", url: "https://www.theaa.com/breakdown-cover/advice/white-smoke-from-exhaust" },
  dpf: { title: "AA: diesel particulate filters", url: "https://www.theaa.com/driving-advice/fuels-environment/diesel-particulate-filters" },
  adblue: { title: "Mercedes-Benz handbook: AdBlue no-start warnings", url: "https://static.oneweb.mercedes-benz.com/css-oom-assets/en-lb/pdf/mercedes-glc-coupe-2018-march-c253-comand-owners-manual-1.pdf" },
  warnings: { title: "AA: dashboard warning lights", url: "https://www.theaa.com/breakdown-cover/advice/dashboard-warning-lights" },
};

// Explicit editorial approval, not a generated-slug or word-count publication gate.
export function isPublishableGuide(guide: ResearchGuide) {
  return guide.status === "indexable" && /^\d{4}-\d{2}-\d{2}$/.test(guide.reviewed)
    && guide.sections.length >= 3 && guide.sections.every((section) =>
      section.paragraphs.length > 0 && section.sources.length > 0
      && section.sources.every((id) => !!researchSources[id]));
}
