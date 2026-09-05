# Global End-to-End Supply-Chain Variable Taxonomy

**Version:** 1.0  
**Scope:** Global, end-to-end, industry-agnostic  
**Catalogue size:** 481 L0 variables, 60 L1 operational groupings, and 35 L2 composite forces  
**Claim:** Broadest practically complete catalogue under the stated modelling rules; not mathematically exhaustive.

## Contents

1. [Taxonomy principles](#1-taxonomy-principles)
2. [Level 0: Atomic-variable catalogue](#2-level-0-atomic-variable-catalogue)
3. [Level 1: Operational-grouping catalogue](#3-level-1-operational-grouping-catalogue)
4. [Level 2: Composite-force catalogue](#4-level-2-composite-force-catalogue)
5. [Hierarchy validation](#5-hierarchy-validation)

## 1. Taxonomy principles

- **L0 — atomic variable:** the smallest useful, observable, estimable, or assignable supply-chain state in this model. It expresses a quantity, rate, duration, condition, constraint, capability, status, or location—not merely an entity name.
- **L1 — operational grouping:** a recognizable operating area composed of multiple L0 variables. An L1 may consume the same L0 as another grouping when the operating processes genuinely share it, but each L1 has a distinct operating purpose.
- **L2 — composite force:** an internal or external system-level condition produced by interactions among multiple L0 variables and L1 groupings. It is decomposable and influences several parts of the network.
- **Entity versus variable:** an entity is a thing (supplier, ship, warehouse); a variable is a property or state of that thing (supplier capacity, ship availability, warehouse utilization).
- **Grouping versus force:** an L1 is something practitioners operate; an L2 is an emergent force they assess, influence, or adapt to.
- **Deduplication:** synonyms are merged under a globally understandable canonical term. Each L0 has one home category; cross-domain effects are expressed through references rather than duplicate rows.
- **Dependency notation:** `D:` means a proximate/direct dependency; `I:` means a material influence. References are principal rather than exhaustive. A range such as `L0-001–L0-004` includes every ID in the range.

## 2. Level 0: Atomic-variable catalogue

### A. Demand, customers, and markets

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-001 | Demand | Demand volume | Quantity requested by a market or customer in a defined period. | units/week; patient visits | D: L0-006, L0-008; I: L0-071, L0-155 |
| L0-002 | Demand | Demand variability | Dispersion of demand around its expected value over a defined horizon. | weekly CV; demand variance | D: L0-001; I: L0-158, L0-332 |
| L0-003 | Demand | Demand seasonality | Repeatable calendar-linked amplitude and timing of demand. | holiday peak; harvest cycle | D: L0-001; I: L0-158, L0-180 |
| L0-004 | Demand | Demand trend rate | Sustained rate and direction of change in demand. | +4% YoY; decline/month | D: L0-001; I: L0-071, L0-424 |
| L0-005 | Demand | Consumption rate | Rate at which end users consume or deplete a product or service. | doses/day; kWh/hour | I: L0-001, L0-155, L0-159 |
| L0-006 | Customer | Order frequency | Number of customer orders placed per unit of time. | orders/day; calls/week | I: L0-001, L0-265, L0-274 |
| L0-007 | Customer | Order-size distribution | Observed spread of quantities per customer order. | cases/order; tonnes/order | I: L0-001, L0-187, L0-205 |
| L0-008 | Customer | Customer service-level requirement | Required probability or proportion of demand fulfilled to commitment. | 98% fill; critical 100% | I: L0-158, L0-268, L0-275 |
| L0-009 | Customer | Customer lead-time tolerance | Maximum elapsed time a customer accepts between order and receipt. | same day; six weeks | I: L0-217, L0-270, L0-275 |
| L0-010 | Customer | Customer price sensitivity | Change in demand associated with a change in selling price. | elasticity -1.2; inelastic drug | D: L0-011; I: L0-001, L0-277 |
| L0-011 | Market | Selling price | Transaction price charged for a product or service. | $/unit; tariff rate | D: L0-299, L0-312; I: L0-001, L0-010 |
| L0-012 | Market | Promotion intensity | Magnitude and duration of demand stimulation by promotions. | 20% discount; two-week campaign | I: L0-001, L0-002, L0-017 |
| L0-013 | Market | Sales-channel mix | Share of demand flowing through each sales or service channel. | 60% retail; 40% online | I: L0-006, L0-276, L0-277 |
| L0-014 | Market | Market geographic dispersion | Spatial spread of demand points relative to supply nodes. | urban cluster; global long tail | I: L0-222, L0-277, L0-425 |
| L0-015 | Market | Customer concentration | Share of revenue or volume attributable to the largest customers. | top-five share; HHI | I: L0-001, L0-304, L0-428 |
| L0-016 | Market | Forecast error | Difference between forecast and realized demand at a stated aggregation and horizon. | MAPE; forecast bias | D: L0-001, L0-323; I: L0-071, L0-158 |

### B. Products, materials, and packaging

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-017 | Product | Active SKU count | Number of distinct stock-keeping units actively planned or sold. | 200 SKUs; 12 formulations | I: L0-020, L0-083, L0-155 |
| L0-018 | Product | Product-mix share | Proportion of total volume represented by each product or service variant. | 30% premium; 5% sterile | D: L0-001, L0-017; I: L0-068, L0-071 |
| L0-019 | Product | Product lifecycle stage | Assigned stage of a product from introduction through withdrawal. | launch; maturity; end-of-life | I: L0-004, L0-152, L0-164 |
| L0-020 | Product | Product configuration count | Number of allowed configurations or variants for a product family. | trim options; care pathways | I: L0-071, L0-083, L0-313 |
| L0-021 | Product | Product customization level | Degree to which output is configured after a customer requirement is known. | make-to-order; engraving | I: L0-009, L0-084, L0-435 |
| L0-022 | Product | Product unit dimensions | External length, width, and height of one handling or selling unit. | 40×30×20 cm; 1 m³ | I: L0-038, L0-175, L0-205 |
| L0-023 | Product | Product unit weight | Mass of one handling or selling unit. | 12 kg; 2 tonnes | I: L0-205, L0-206, L0-255 |
| L0-024 | Product | Product value density | Monetary value per unit of weight or volume. | $/kg; $/m³ | D: L0-011, L0-022, L0-023; I: L0-306, L0-354 |
| L0-025 | Product | Product criticality | Assigned consequence class of product unavailability or failure. | life-saving; line-stop part | I: L0-008, L0-268, L0-362 |
| L0-026 | Product | Product shelf life | Usable elapsed time before expiry under specified conditions. | 48 hours; 24 months | I: L0-165, L0-178, L0-212 |
| L0-027 | Product | Product substitutability | Degree to which another product can satisfy the same need. | generic drug; alternate grade | I: L0-001, L0-158, L0-271 |
| L0-028 | Material | Bill-of-material complexity | Count and structural depth of distinct inputs required per output. | 2,000 parts; three-level recipe | I: L0-029, L0-055, L0-313 |
| L0-029 | Material | Material requirement quantity | Standard quantity of an input required per unit or batch of output. | 2 kg/unit; 4 vials/case | D: L0-028; I: L0-052, L0-142, L0-075 |
| L0-030 | Material | Material availability | Quantity of a specified material accessible at the required place and time. | resin tonnes; donor blood units | D: L0-052, L0-155; I: L0-066, L0-071 |
| L0-031 | Material | Material grade conformance | Degree to which material properties meet the specified grade. | purity; tensile strength | I: L0-074, L0-135, L0-143 |
| L0-032 | Material | Material substitutability | Degree to which an alternate input can meet the same functional specification. | alloy alternate; recycled feedstock | I: L0-030, L0-055, L0-421 |
| L0-033 | Material | Material perishability | Rate at which material loses utility under defined storage conditions. | produce decay; reagent stability | I: L0-026, L0-165, L0-178 |
| L0-034 | Material | Material hazard classification | Assigned handling and transport class based on inherent hazards. | flammable; biohazard; corrosive | I: L0-179, L0-213, L0-400 |
| L0-035 | Material | Material country of origin | Jurisdiction in which a material qualifies as originating under applicable rules. | India; EU origin | I: L0-060, L0-408, L0-410 |
| L0-036 | Material | Recycled-content share | Proportion of input material derived from recovered sources. | 30% recycled resin; scrap steel | I: L0-032, L0-376, L0-382 |
| L0-037 | Packaging | Packaging material availability | Quantity of compliant packaging material accessible when required. | cartons; sterile vials | I: L0-030, L0-191, L0-274 |
| L0-038 | Packaging | Pack-unit dimensions | External dimensions of the packed handling unit. | carton size; pallet footprint | D: L0-022; I: L0-175, L0-205 |
| L0-039 | Packaging | Packaging protection performance | Measured ability of packaging to prevent damage, contamination, or degradation. | drop rating; barrier strength | I: L0-143, L0-201, L0-233 |
| L0-040 | Packaging | Packaging mass | Total mass of packaging per saleable or handling unit. | grams/unit; kg/pallet | I: L0-023, L0-206, L0-380 |
| L0-041 | Packaging | Packaging recyclability | Proportion of packaging technically and locally recoverable. | mono-material pouch; recyclable crate | I: L0-382, L0-384, L0-423 |
| L0-042 | Packaging | Label-data accuracy | Conformance of product, handling, hazard, and regulatory label data to the intended record. | lot code; UN label | D: L0-314; I: L0-154, L0-405 |

### C. Suppliers, sourcing, procurement, and contracting

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-043 | Supplier | Qualified-supplier count | Number of suppliers approved for a specified item, service, or region. | one source; five carriers | D: L0-057; I: L0-050, L0-359 |
| L0-044 | Supplier | Supplier capacity | Maximum sustainable output a supplier can provide in a stated period. | tonnes/month; API calls/sec | I: L0-030, L0-052, L0-066 |
| L0-045 | Supplier | Supplier capacity utilization | Share of supplier capacity currently committed or used. | 85%; fully booked | D: L0-044; I: L0-046, L0-052 |
| L0-046 | Supplier | Supplier lead time | Elapsed time from valid order release to supplier delivery. | 14 days; 26 weeks | I: L0-070, L0-158, L0-270 |
| L0-047 | Supplier | Supplier lead-time variability | Dispersion of realized supplier lead times around the expected value. | standard deviation; P95-P50 | D: L0-046; I: L0-158, L0-328 |
| L0-048 | Supplier | Supplier on-time-in-full rate | Proportion of supplier deliveries received by commitment date and quantity. | 94% OTIF; line-item OTIF | D: L0-046, L0-052; I: L0-162, L0-183 |
| L0-049 | Supplier | Supplier defect rate | Proportion of supplied units or lots failing agreed requirements. | ppm; rejected lots | I: L0-057, L0-135, L0-143 |
| L0-050 | Supplier | Supplier financial-health score | Assigned state of a supplier's solvency and funding capacity. | credit score; distress flag | D: L0-298, L0-305; I: L0-044, L0-359 |
| L0-051 | Supplier | Supplier geographic concentration | Share of sourced volume clustered in the same hazard or jurisdiction zone. | 70% one province; single basin | D: L0-432; I: L0-393, L0-425 |
| L0-052 | Supplier | Supplier allocation quantity | Quantity a supplier commits to a buyer for a stated period. | tonnes/month; reserved slots | D: L0-044, L0-064; I: L0-030, L0-066 |
| L0-053 | Supplier | Supplier flexibility | Achievable change in supplier volume or mix within a stated time and cost. | ±20%/week; rush lot | I: L0-044, L0-054, L0-067 |
| L0-054 | Supplier | Supplier switching time | Elapsed time required to qualify and activate an alternate supplier. | 30 days; 18 months | D: L0-057, L0-137; I: L0-359, L0-428 |
| L0-055 | Supplier network | Sub-tier dependency count | Number of known critical upstream dependencies behind a direct supplier. | sole smelter; shared cloud host | I: L0-056, L0-325, L0-370 |
| L0-056 | Supplier network | Sub-tier visibility depth | Number of supplier tiers for which identity and dependency data are available. | tier 1 only; through tier 4 | I: L0-055, L0-325, L0-370 |
| L0-057 | Supplier | Supplier qualification status | Current approval state of a supplier for a defined scope. | approved; conditional; blocked | D: L0-049, L0-135; I: L0-043, L0-054 |
| L0-058 | Supplier | Supplier compliance status | Current conformance state against contractual, legal, ethical, and sustainability requirements. | valid audit; overdue CAPA | D: L0-153, L0-399, L0-400; I: L0-057 |
| L0-059 | Supplier | Supplier innovation capability | Demonstrated ability of a supplier to develop or industrialize improved solutions. | joint patent; rapid prototype | I: L0-053, L0-472, L0-475 |
| L0-060 | Sourcing | Local-content share | Proportion of sourced value qualifying as local under the applicable rule. | 40% domestic value; local labor | D: L0-035, L0-408; I: L0-423 |
| L0-061 | Procurement | Purchase price | Contracted or transacted price paid per purchased unit. | $/kg; hourly rate | D: L0-064; I: L0-292, L0-299 |
| L0-062 | Procurement | Purchase-price variability | Dispersion or change rate of purchase prices over time. | monthly volatility; index delta | D: L0-061; I: L0-299, L0-457 |
| L0-063 | Procurement | Bid competition count | Number of compliant bids received for a sourcing event. | two bids; seven bids | D: L0-043; I: L0-061, L0-064 |
| L0-064 | Contract | Contracted-volume coverage | Share of expected requirement covered by enforceable supply commitments. | 80% annual need; 3-year PPA | D: L0-001, L0-029; I: L0-052, L0-062 |
| L0-065 | Contract | Contract term | Elapsed duration for which a supply agreement remains effective. | 90 days; five years | I: L0-064, L0-066, L0-419 |
| L0-066 | Contract | Contract volume flexibility | Permitted quantity variance from committed volume without renegotiation. | ±10%; swing option | D: L0-064; I: L0-053, L0-068 |
| L0-067 | Contract | Contract lead-time flexibility | Permitted change to delivery timing under an agreement. | expedite window; deferment right | D: L0-046, L0-065; I: L0-147, L0-184 |
| L0-068 | Procurement | Minimum order quantity | Smallest quantity a supplier accepts per order or release. | 500 units; full truckload | I: L0-007, L0-160, L0-163 |
| L0-069 | Procurement | Procurement approval time | Elapsed time from purchase request readiness to authorized commitment. | hours; committee cycle | I: L0-070, L0-331, L0-436 |
| L0-070 | Procurement | Purchase-order accuracy | Proportion of purchase orders with correct item, quantity, price, terms, and destination. | line accuracy; error-free PO | D: L0-061, L0-314; I: L0-046, L0-183 |

### D. Production, equipment, automation, and maintenance

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-071 | Production | Production capacity | Maximum sustainable conforming output of a process in a stated period. | units/hour; procedures/day | D: L0-077, L0-101, L0-121; I: L0-066, L0-274 |
| L0-072 | Production | Capacity utilization | Share of available production capacity used in a stated period. | 78%; peak 96% | D: L0-071, L0-075; I: L0-076, L0-083 |
| L0-073 | Production | Throughput rate | Quantity of conforming output completed per unit of time. | units/hour; tonnes/day | D: L0-074, L0-075, L0-088; I: L0-155 |
| L0-074 | Production | Process yield | Proportion of input converted into conforming output. | first-pass yield; extraction yield | D: L0-029, L0-075; I: L0-030, L0-126 |
| L0-075 | Production | Production input quantity | Quantity of material released to a process in a stated period. | kg/batch; components/shift | D: L0-029, L0-030; I: L0-073, L0-144 |
| L0-076 | Production | Process cycle time | Elapsed processing time from work start to operation completion. | minutes/unit; days/case | I: L0-071, L0-073, L0-080 |
| L0-077 | Production | Scheduled production time | Time during which a production resource is planned to operate. | hours/shift; clinic hours | I: L0-071, L0-084, L0-098 |
| L0-078 | Production | Schedule adherence | Proportion of planned production completed in the specified sequence and time window. | plan attainment; sequence compliance | D: L0-077; I: L0-155, L0-270 |
| L0-079 | Production | Work-in-process quantity | Quantity that has entered but not completed a production process. | open jobs; semi-finished tonnes | D: L0-075, L0-073; I: L0-080, L0-144 |
| L0-080 | Production | Production queue time | Elapsed waiting time before a job begins its next production operation. | hours at bottleneck; case wait | D: L0-079, L0-071; I: L0-076, L0-078 |
| L0-081 | Production | Batch size | Quantity processed together under one production order or control lot. | 10,000 tablets; 20 cases | I: L0-068, L0-076, L0-144 |
| L0-082 | Production | Changeover time | Elapsed time to convert a resource from one product, service, or configuration to another. | die change; sanitation | I: L0-071, L0-083, L0-099 |
| L0-083 | Production | Production mix flexibility | Achievable change in output mix within a stated time and cost. | model swap; flexible cell | D: L0-082, L0-099; I: L0-018, L0-021 |
| L0-084 | Production | Production volume flexibility | Achievable change in output quantity within a stated time and cost. | overtime surge; extra batch | D: L0-071, L0-107; I: L0-002, L0-066 |
| L0-085 | Production | Scrap rate | Proportion of production input discarded without saleable recovery. | trim loss; rejected batch | D: L0-075; I: L0-074, L0-380 |
| L0-086 | Production | Rework rate | Proportion of output requiring additional processing to conform. | repair loop; relabelling | I: L0-074, L0-076, L0-141 |
| L0-087 | Equipment | Machine capacity | Maximum sustainable output of a specified machine or equipment unit. | cycles/hour; MW | I: L0-071, L0-090, L0-100 |
| L0-088 | Equipment | Equipment availability | Proportion of required time equipment is capable of operation. | 97% uptime; ready/not ready | D: L0-090, L0-091; I: L0-071, L0-073 |
| L0-089 | Equipment | Equipment utilization | Share of available equipment time spent productively operating. | spindle hours; vehicle duty | D: L0-088; I: L0-073, L0-095 |
| L0-090 | Reliability | Failure frequency | Number of functional equipment failures per operating time or cycle. | failures/1,000 h; incidents/month | I: L0-088, L0-091, L0-092 |
| L0-091 | Maintenance | Repair time | Elapsed time from maintenance work start to restored equipment function. | MTTR; hours/repair | D: L0-098, L0-100; I: L0-088, L0-097 |
| L0-092 | Maintenance | Maintenance backlog | Quantity or labor-hours of approved maintenance work not yet completed. | open work orders; craft hours | I: L0-090, L0-098, L0-101 |
| L0-093 | Maintenance | Preventive-maintenance compliance | Proportion of scheduled preventive work completed within its due window. | PM completion; inspection compliance | I: L0-090, L0-095, L0-097 |
| L0-094 | Reliability | Condition-monitoring coverage | Proportion of critical assets monitored for degradation indicators. | vibration sensors; oil analysis | I: L0-090, L0-095, L0-318 |
| L0-095 | Equipment | Equipment condition index | Assigned health state of equipment based on inspection or sensor evidence. | good/fair/poor; health score | D: L0-094; I: L0-090, L0-096 |
| L0-096 | Maintenance | Planned-downtime duration | Time equipment is deliberately unavailable for approved work. | overhaul hours; sanitation stop | I: L0-077, L0-088, L0-093 |
| L0-097 | Reliability | Unplanned-downtime duration | Time equipment is unexpectedly incapable of required operation. | breakdown hours; outage minutes | D: L0-090, L0-091; I: L0-071, L0-078 |
| L0-098 | Maintenance | Maintenance-labor availability | Qualified maintenance labor-hours accessible in the required window. | technicians/shift; contractor hours | D: L0-101, L0-102; I: L0-091, L0-092 |
| L0-099 | Tooling | Tooling availability | Quantity of conforming tools, molds, fixtures, or test rigs ready for use. | dies; jigs; sterile kits | D: L0-100; I: L0-071, L0-082 |
| L0-100 | Maintenance | Maintenance-spare availability | Quantity of required equipment spares accessible when needed. | bearings; robot controller | D: L0-030, L0-155; I: L0-091, L0-097 |

### E. Workforce, skills, health, and safety

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-101 | Workforce | Worker availability | Number of workers able and authorized to work in a required time and place. | operators/shift; clinicians/day | D: L0-105, L0-106; I: L0-071, L0-176 |
| L0-102 | Workforce | Skill availability | Quantity of labor-hours available with a specified competency or license. | welders; customs brokers | D: L0-101, L0-110; I: L0-074, L0-204 |
| L0-103 | Workforce | Worker productivity | Conforming output produced per worker-hour under stated conditions. | picks/hour; cases/FTE | D: L0-102; I: L0-073, L0-188 |
| L0-104 | Workforce | Labor-cost rate | Direct compensation and employer cost per labor-hour. | $/hour; loaded rate | I: L0-292, L0-454, L0-460 |
| L0-105 | Workforce | Absence rate | Proportion of scheduled labor time lost to absence. | sick leave; no-show rate | I: L0-101, L0-113, L0-463 |
| L0-106 | Workforce | Employee-turnover rate | Proportion of workers leaving a role or organization in a stated period. | monthly attrition; seasonal churn | I: L0-101, L0-102, L0-109 |
| L0-107 | Workforce | Overtime availability | Additional labor-hours legally and practically usable beyond regular schedules. | weekend shift; overtime cap | I: L0-084, L0-101, L0-399 |
| L0-108 | Workforce | Shift coverage | Proportion of planned positions staffed with qualified workers. | night-shift fill; roster coverage | D: L0-101, L0-102; I: L0-077, L0-176 |
| L0-109 | Workforce | Time to competency | Elapsed time for a worker to achieve required independent performance. | training weeks; supervised cases | D: L0-110; I: L0-102, L0-106 |
| L0-110 | Workforce | Training-completion status | Current completion state of required training for an individual or role. | certified; overdue module | I: L0-102, L0-109, L0-137 |
| L0-111 | Workforce | Worker engagement score | Observed indicator of discretionary effort, commitment, and intent to stay. | survey index; eNPS | I: L0-103, L0-106, L0-117 |
| L0-112 | Workforce | Labor-relations status | Current state of employer-worker or union relations affecting operations. | agreement active; strike notice | I: L0-101, L0-107, L0-466 |
| L0-113 | Health | Occupational-illness incidence | Number of work-related illness cases per exposure unit. | cases/100 FTE; hearing loss | I: L0-105, L0-114, L0-115 |
| L0-114 | Safety | Safety-incident rate | Number of recordable worker safety events per exposure unit. | TRIR; lost-time rate | I: L0-101, L0-115, L0-137 |
| L0-115 | Safety | Hazard-exposure level | Measured worker exposure to a specified physical, chemical, biological, or ergonomic hazard. | dB; ppm; lifting score | D: L0-034; I: L0-113, L0-114 |
| L0-116 | Safety | Personal-protective-equipment availability | Quantity of required protective equipment ready at point of use. | respirators; gloves | D: L0-030; I: L0-114, L0-137 |
| L0-117 | Workforce | Fatigue-risk level | Assigned likelihood that work-rest patterns impair safe performance. | hours awake; fatigue score | D: L0-107, L0-108; I: L0-103, L0-114 |
| L0-118 | Workforce | Worker mobility eligibility | Proportion of required workers legally able to enter or work in a location. | visa valid; license reciprocity | I: L0-101, L0-137, L0-459 |
| L0-119 | Workforce | Workforce demographic mix | Distribution of worker age, tenure, and other planning-relevant characteristics. | retirement exposure; tenure bands | I: L0-102, L0-106, L0-449 |
| L0-120 | Workforce | Supervisor span of control | Number of direct operational reports per supervisor. | 1:8; 1:30 | I: L0-103, L0-108, L0-114 |

### F. Energy, water, and utilities

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-121 | Utility | Electricity availability | Electrical power capacity accessible at the required place and time. | MW available; grid connected | I: L0-071, L0-178, L0-315 |
| L0-122 | Utility | Electricity price | Price paid per unit of electrical energy, including applicable charges. | $/kWh; peak tariff | I: L0-292, L0-375, L0-460 |
| L0-123 | Utility | Fuel availability | Quantity of required operational fuel accessible at the needed location and time. | diesel litres; jet fuel tonnes | I: L0-203, L0-216, L0-232 |
| L0-124 | Utility | Fuel price | Price paid per unit of operational fuel. | $/litre; bunker index | I: L0-216, L0-292, L0-460 |
| L0-125 | Utility | Natural-gas availability | Gas flow capacity accessible for process, heat, or power use. | MMBtu/day; pipeline supply | I: L0-071, L0-127, L0-469 |
| L0-126 | Utility | Process-water availability | Volume and flow of specification-grade water accessible when required. | m³/day; purified water | I: L0-071, L0-378, L0-394 |
| L0-127 | Utility | Utility-outage duration | Elapsed time a required utility is unavailable or outside specification. | blackout minutes; steam outage | I: L0-071, L0-199, L0-365 |
| L0-128 | Utility | Utility-quality conformance | Degree to which supplied utilities meet voltage, pressure, purity, or continuity specifications. | voltage stability; steam grade | I: L0-074, L0-126, L0-129 |
| L0-129 | Utility | Backup-power capacity | Maximum critical load supportable by onsite or contracted backup supply. | generator MW; battery MWh | I: L0-127, L0-130, L0-365 |
| L0-130 | Utility | Backup-power endurance | Time backup energy can sustain its assigned load without replenishment. | battery hours; fuel days | D: L0-129, L0-123; I: L0-365 |
| L0-131 | Utility | Refrigeration capacity | Maximum thermal load that controlled-cooling assets can maintain. | kW cooling; pallet positions | I: L0-178, L0-199, L0-213 |
| L0-132 | Utility | Renewable-electricity share | Proportion of consumed electricity supplied from qualifying renewable sources. | solar PPA; green tariff | D: L0-121; I: L0-372, L0-376 |
| L0-133 | Utility | Water price | Price paid per unit of intake, treatment, and discharge water. | $/m³; sewer charge | I: L0-292, L0-377, L0-460 |
| L0-134 | Utility | Utility-meter coverage | Proportion of material utility flows measured at useful operational granularity. | submetered lines; smart meters | I: L0-318, L0-375, L0-377 |

### G. Quality, product safety, and operational compliance

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-135 | Quality | Incoming-defect rate | Proportion of received units or lots failing incoming requirements. | ppm; rejected receipts | D: L0-049; I: L0-136, L0-169 |
| L0-136 | Quality | Incoming-inspection rate | Proportion of received units or lots subjected to defined inspection. | sample rate; 100% inspection | I: L0-135, L0-138, L0-169 |
| L0-137 | Compliance | Operating-qualification status | Current authorization state of a person, process, asset, or site for its assigned task. | licensed; validated; suspended | D: L0-110; I: L0-057, L0-071, L0-176 |
| L0-138 | Quality | Inspection capacity | Maximum number of inspections or tests executable in a stated period. | lots/day; samples/hour | D: L0-139, L0-102; I: L0-136, L0-144 |
| L0-139 | Quality | Test-equipment availability | Quantity of calibrated test resources ready when required. | lab instruments; gauges | D: L0-140; I: L0-138, L0-144 |
| L0-140 | Quality | Calibration-compliance rate | Proportion of measuring equipment within its valid calibration state. | gauges in date; lab compliance | I: L0-139, L0-142, L0-154 |
| L0-141 | Quality | In-process defect rate | Proportion of units failing requirements before process completion. | defect ppm; failed observations | I: L0-074, L0-086, L0-142 |
| L0-142 | Quality | Process-parameter conformance | Proportion of monitored process parameters held within approved limits. | temperature; torque; dwell | D: L0-318; I: L0-074, L0-141 |
| L0-143 | Quality | Finished-output defect rate | Proportion of completed units failing release or customer requirements. | rejected lots; escape rate | D: L0-141; I: L0-145, L0-146 |
| L0-144 | Quality | Lot-release time | Elapsed time from process completion to authorized product release. | QA hours; customs seal release | D: L0-138, L0-145; I: L0-155, L0-270 |
| L0-145 | Quality | Release-approval status | Current disposition of output awaiting authorized release. | released; quarantined; rejected | D: L0-143, L0-152; I: L0-144, L0-155 |
| L0-146 | Quality | Customer-complaint rate | Number of validated quality or service complaints per delivered unit or order. | complaints/million; cases/month | I: L0-143, L0-227, L0-233 |
| L0-147 | Quality | Corrective-action closure time | Elapsed time from approved corrective action to verified closure. | CAPA days; remediation SLA | I: L0-146, L0-148, L0-437 |
| L0-148 | Quality | Deviation rate | Number of approved or unapproved departures from standard per activity volume. | deviations/batch; waivers/month | I: L0-142, L0-147, L0-154 |
| L0-149 | Product safety | Contamination-event rate | Frequency of confirmed biological, chemical, or foreign-material contamination. | recalls/year; positive samples | I: L0-033, L0-143, L0-153 |
| L0-150 | Product safety | Recall frequency | Number of formal product-retrieval actions in a stated period. | Class I recalls; field actions | D: L0-149, L0-143; I: L0-280, L0-306 |
| L0-151 | Quality | Traceability granularity | Smallest lot, serial, batch, or event unit uniquely traceable across the network. | serial unit; production lot | D: L0-319; I: L0-150, L0-280 |
| L0-152 | Compliance | Product-registration status | Current legal authorization to market a product in a jurisdiction. | approved; pending; expired | D: L0-421; I: L0-019, L0-145 |
| L0-153 | Compliance | Quality-certification status | Current standing of required quality-system certifications. | ISO 9001; GMP certificate | I: L0-057, L0-137, L0-399 |
| L0-154 | Compliance | Compliance-document completeness | Proportion of required operational or product records present and valid. | batch record; certificate pack | D: L0-313, L0-314; I: L0-145, L0-342 |

### H. Inventory

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-155 | Inventory | On-hand inventory quantity | Physical quantity of an item present at a location at a point in time. | units; tonnes; beds | D: L0-169, L0-170; I: L0-156, L0-162 |
| L0-156 | Inventory | Available-to-promise quantity | Uncommitted inventory and planned supply that can be promised under current rules. | ATP units; open appointment slots | D: L0-155, L0-157; I: L0-267, L0-271 |
| L0-157 | Inventory | Allocated inventory quantity | Inventory reserved to specific demand, customers, channels, or priorities. | order reservation; emergency stock | D: L0-155; I: L0-156, L0-267 |
| L0-158 | Inventory | Safety-stock target | Planned inventory buffer intended to absorb uncertainty over replenishment time. | units; days; confidence level | D: L0-002, L0-047; I: L0-155, L0-162 |
| L0-159 | Inventory | Reorder point | Inventory-position threshold that triggers replenishment action. | 500 units; two-bin trigger | D: L0-005, L0-046, L0-158; I: L0-160 |
| L0-160 | Inventory | Replenishment quantity | Quantity released or proposed by a replenishment decision. | EOQ; full pallet | D: L0-068, L0-159; I: L0-155, L0-163 |
| L0-161 | Inventory | Days of supply | Time current usable inventory would cover expected consumption at a stated rate. | 12 days; 4 hours | D: L0-155, L0-005; I: L0-162, L0-165 |
| L0-162 | Inventory | Stockout rate | Proportion of demand events encountering no usable available inventory. | line stockouts; dose shortages | D: L0-156, L0-001; I: L0-146, L0-271 |
| L0-163 | Inventory | Excess-inventory quantity | Usable inventory above the approved requirement or maximum policy level. | surplus units; overstock | D: L0-155, L0-001; I: L0-165, L0-295 |
| L0-164 | Inventory | Obsolete-inventory quantity | Inventory no longer expected to be used or sold under current specifications or demand. | superseded parts; withdrawn labels | D: L0-019, L0-155; I: L0-296, L0-384 |
| L0-165 | Inventory | Expiry-exposed quantity | Inventory forecast to expire before expected use or sale. | short-dated doses; aging food | D: L0-026, L0-155; I: L0-280, L0-296 |
| L0-166 | Inventory | Inventory age | Elapsed time since an inventory unit or lot entered its current age clock. | days since manufacture; dwell age | I: L0-165, L0-270, L0-280 |
| L0-167 | Inventory | Inventory-turnover rate | Annualized usage or cost of goods sold divided by average inventory. | turns/year; slow mover | D: L0-155, L0-005; I: L0-294, L0-300 |
| L0-168 | Inventory | Inventory shrinkage rate | Proportion of recorded inventory lost to theft, damage, spoilage, or unexplained variance. | cycle-count loss; leakage | I: L0-155, L0-171, L0-354 |
| L0-169 | Inventory | Inventory-record accuracy | Agreement between system inventory records and verified physical state. | location accuracy; count variance | D: L0-285, L0-320; I: L0-156, L0-178 |
| L0-170 | Inventory | Inventory-status accuracy | Agreement between recorded and actual usability, ownership, hold, and release state. | quarantine flag; title status | D: L0-145, L0-169; I: L0-156, L0-157 |
| L0-171 | Inventory | Inventory-damage rate | Proportion of stored inventory rendered nonconforming by damage. | crushed cases; corrosion | I: L0-039, L0-184, L0-201 |
| L0-172 | Inventory | Consignment-inventory share | Proportion of inventory physically held but owned by another party until use or sale. | vendor stock; hospital implants | I: L0-155, L0-291, L0-300 |
| L0-173 | Inventory | Inventory carrying-cost rate | Periodic cost of holding inventory as a proportion of inventory value. | %/year; storage plus capital | D: L0-293, L0-294, L0-295; I: L0-158 |
| L0-174 | Inventory | Cycle-count completion rate | Proportion of required inventory verification counts completed on schedule. | ABC counts; daily bins | I: L0-169, L0-168, L0-397 |

### I. Warehousing, storage, handling, and internal material movement

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-175 | Storage | Storage capacity | Maximum quantity or volume a facility can safely store under specified conditions. | pallet positions; tank m³ | I: L0-155, L0-176, L0-429 |
| L0-176 | Storage | Storage utilization | Share of usable storage capacity currently occupied or committed. | 88% pallets; tank fill | D: L0-175, L0-155; I: L0-178, L0-186 |
| L0-177 | Storage | Ambient-storage capacity | Storage capacity available without active temperature or hazard controls. | dry pallets; open yard | D: L0-175; I: L0-163, L0-176 |
| L0-178 | Storage | Temperature-controlled capacity | Storage capacity capable of maintaining a specified temperature range. | frozen pallets; 2–8°C rooms | D: L0-131, L0-175; I: L0-026, L0-165 |
| L0-179 | Storage | Hazardous-material storage capacity | Storage capacity authorized for defined hazardous classes. | flammable cage; chemical tank | D: L0-034, L0-137; I: L0-175, L0-365 |
| L0-180 | Warehouse | Warehouse-labor availability | Qualified warehouse labor-hours accessible in the required window. | receivers/shift; pickers/day | D: L0-101, L0-102; I: L0-183, L0-188 |
| L0-181 | Warehouse | Dock-door availability | Number of compatible dock positions ready in a stated time window. | inbound bays; parcel doors | I: L0-183, L0-197, L0-236 |
| L0-182 | Warehouse | Receiving-queue quantity | Number or volume of inbound loads awaiting receipt processing. | trailers; pallets; samples | D: L0-202, L0-181; I: L0-183, L0-236 |
| L0-183 | Warehouse | Receiving throughput | Quantity accepted into a facility per unit of time. | pallets/hour; cases/day | D: L0-180, L0-181; I: L0-169, L0-184 |
| L0-184 | Warehouse | Put-away time | Elapsed time from receipt acceptance to confirmed storage availability. | minutes/pallet; hours/lot | D: L0-183, L0-189; I: L0-156, L0-176 |
| L0-185 | Warehouse | Location-slot availability | Number or volume of compatible storage slots currently assignable. | empty bins; rack positions | D: L0-175, L0-176; I: L0-184, L0-188 |
| L0-186 | Warehouse | Aisle-congestion level | Degree to which traffic conflicts constrain safe warehouse movement. | queue length; blocked minutes | I: L0-176, L0-189, L0-193 |
| L0-187 | Warehouse | Pick-queue quantity | Number of order lines or tasks awaiting picking. | waves; lines; cases | D: L0-267, L0-268; I: L0-188, L0-274 |
| L0-188 | Warehouse | Picking rate | Quantity of correct items picked per unit of labor or clock time. | lines/hour; cases/hour | D: L0-180, L0-190; I: L0-187, L0-274 |
| L0-189 | Material handling | Handling-equipment availability | Quantity of forklifts, conveyors, cranes, or robots ready for assigned work. | forklifts/shift; conveyor uptime | D: L0-088; I: L0-183, L0-188 |
| L0-190 | Warehouse | Pick accuracy | Proportion of picked lines with correct item, lot, quantity, and destination. | line accuracy; zero-error picks | D: L0-169, L0-320; I: L0-247, L0-252 |
| L0-191 | Warehouse | Packing rate | Quantity of order units correctly packed per unit of time. | cartons/hour; kits/day | D: L0-180, L0-037; I: L0-246, L0-248 |
| L0-192 | Warehouse | Staging capacity | Maximum outbound or inbound volume safely held in temporary staging. | pallet lanes; trailer buffers | I: L0-181, L0-236, L0-274 |
| L0-193 | Material handling | Internal-transport availability | Quantity of internal transport resources ready where and when required. | tuggers; AGVs; porters | D: L0-189, L0-101; I: L0-184, L0-194 |
| L0-194 | Material handling | Internal-move time | Elapsed time to transfer material between internal origin and destination. | dock-to-line; ward transfer | D: L0-193, L0-195; I: L0-080, L0-274 |
| L0-195 | Material handling | Internal-route distance | Travel distance along the authorized path between internal work points. | metres; floor-to-floor | I: L0-194, L0-196, L0-430 |
| L0-196 | Material handling | Internal-route accessibility | Current ability of a route to support the assigned load, clearance, and safety conditions. | aisle open; elevator limit | I: L0-114, L0-193, L0-194 |
| L0-197 | Yard | Yard capacity | Maximum compatible vehicles, containers, or loads a facility yard can hold. | trailer spots; TEU ground slots | I: L0-198, L0-202, L0-236 |
| L0-198 | Yard | Yard-dwell time | Elapsed time a vehicle, container, or load remains in a facility yard. | gate-to-gate hours; trailer days | D: L0-197, L0-181; I: L0-218, L0-236 |
| L0-199 | Storage | Storage-temperature conformance | Proportion of stored time within specified temperature range. | cold-room compliance; excursion mins | D: L0-178, L0-318; I: L0-165, L0-171 |
| L0-200 | Storage | Storage-humidity conformance | Proportion of stored time within specified humidity range. | RH compliance; excursion hours | D: L0-318; I: L0-033, L0-171 |
| L0-201 | Handling | Handling-damage rate | Proportion of units damaged during receiving, movement, picking, packing, or loading. | broken cases; dented coils | I: L0-039, L0-186, L0-189 |

### J. Transportation, mobile assets, carriers, and cargo

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-202 | Transportation | Freight-volume requirement | Quantity of cargo requiring movement on a lane in a stated period. | tonnes/week; parcels/day | D: L0-001, L0-007; I: L0-205, L0-232 |
| L0-203 | Road transport | Road-vehicle availability | Number of compatible road vehicles ready in the required time and region. | trucks; vans; tankers | D: L0-217, L0-220; I: L0-202, L0-227 |
| L0-204 | Road transport | Driver availability | Number of qualified drivers available in the required time and region. | drivers/shift; licensed teams | D: L0-101, L0-102; I: L0-203, L0-227 |
| L0-205 | Transportation | Vehicle capacity | Maximum payload weight, volume, units, or passengers supported by a vehicle. | tonnes; m³; seats | I: L0-202, L0-206, L0-223 |
| L0-206 | Transportation | Vehicle utilization | Share of usable vehicle capacity occupied on a movement. | cube fill; payload fill | D: L0-202, L0-205; I: L0-210, L0-232 |
| L0-207 | Rail transport | Railcar availability | Number of compatible railcars ready in the required time and network. | wagons; refrigerated cars | D: L0-217; I: L0-202, L0-228 |
| L0-208 | Rail transport | Train-path availability | Number of operable scheduled rail paths available for freight movement. | slots/day; train paths | D: L0-253; I: L0-207, L0-228 |
| L0-209 | Maritime transport | Vessel availability | Number of compatible vessels open for the required origin, destination, and dates. | container ships; barges | D: L0-217; I: L0-202, L0-229 |
| L0-210 | Maritime transport | Vessel capacity | Maximum compatible cargo quantity a vessel can carry. | TEU; deadweight tonnes | I: L0-202, L0-211, L0-229 |
| L0-211 | Maritime transport | Container availability | Number of compatible empty containers accessible at the required location and time. | 40-ft dry; reefers | I: L0-202, L0-209, L0-231 |
| L0-212 | Air transport | Aircraft cargo-capacity availability | Cargo weight or volume offered on compatible flights in the required window. | belly tonnes; freighter pallets | D: L0-217, L0-230; I: L0-202, L0-025 |
| L0-213 | Cold-chain transport | Mobile refrigeration availability | Quantity of functioning refrigerated transport equipment available for assignment. | reefer units; cold boxes | D: L0-131, L0-203, L0-211; I: L0-026, L0-234 |
| L0-214 | Transportation | Carrier count | Number of qualified carriers capable of serving a defined lane and mode. | three hauliers; two airlines | D: L0-137; I: L0-217, L0-428 |
| L0-215 | Transportation | Carrier service reliability | Proportion of carrier movements meeting agreed operational commitments. | schedule reliability; pickup SLA | D: L0-226, L0-227; I: L0-247, L0-391 |
| L0-216 | Transportation | Freight rate | Price charged to move a unit of cargo on a defined service and lane. | $/TEU; $/kg; parcel rate | D: L0-217, L0-224; I: L0-292, L0-460 |
| L0-217 | Transportation | Transport-capacity availability | Quantity of compatible transport capacity offered for a lane, mode, and time window. | truck slots; tonnes/day | D: L0-203, L0-207, L0-209, L0-212; I: L0-202 |
| L0-218 | Transportation | Transit time | Elapsed time from transport departure at origin to arrival at destination. | hours; ocean days | D: L0-222, L0-225; I: L0-227, L0-270 |
| L0-219 | Transportation | Transit-time variability | Dispersion of realized transit time around its expected value. | P95-P50; standard deviation | D: L0-218; I: L0-158, L0-267 |
| L0-220 | Transportation | Mobile-asset condition | Assigned roadworthiness or operational-health state of a vehicle, vessel, railcar, or aircraft. | airworthy; inspection score | D: L0-093, L0-095; I: L0-203, L0-207, L0-209 |
| L0-221 | Transportation | Departure frequency | Number of scheduled or available departures per unit of time. | sailings/week; flights/day | D: L0-217; I: L0-218, L0-267 |
| L0-222 | Transportation | Route distance | Travel distance along the planned transport path. | road km; nautical miles | I: L0-218, L0-224, L0-232 |
| L0-223 | Transportation | Route accessibility | Current ability of a route to support the assigned mode, asset, load, and legal restrictions. | pass open; axle limit | I: L0-217, L0-218, L0-328 |
| L0-224 | Transportation | Transport fuel consumption | Fuel or energy consumed per movement or distance. | litres/100 km; kWh/km | D: L0-205, L0-206, L0-222; I: L0-124, L0-380 |
| L0-225 | Transportation | En-route delay duration | Time lost after departure due to congestion, controls, incidents, or weather. | queue hours; holding time | I: L0-218, L0-226, L0-241 |
| L0-226 | Transportation | On-time pickup rate | Proportion of shipments collected within the committed pickup window. | pickup SLA; gate appointment | D: L0-203, L0-204; I: L0-215, L0-227 |
| L0-227 | Transportation | On-time delivery rate | Proportion of shipments delivered within the committed delivery window. | OTD; appointment compliance | D: L0-218, L0-225; I: L0-215, L0-247 |
| L0-228 | Rail transport | Rail-terminal dwell time | Elapsed time cargo or railcars remain at a rail terminal between movements. | interchange hours; yard days | I: L0-208, L0-218, L0-249 |
| L0-229 | Maritime transport | Port-to-port schedule reliability | Proportion of vessel services arriving within the defined schedule tolerance. | within 24 h; blank-sailing effect | D: L0-209, L0-241; I: L0-215, L0-218 |
| L0-230 | Air transport | Flight-cargo schedule reliability | Proportion of booked air cargo movements operating within defined schedule tolerance. | uplift success; arrival SLA | D: L0-212, L0-250; I: L0-215, L0-218 |
| L0-231 | Transportation | Equipment-repositioning time | Elapsed time to move empty transport equipment to its next required location. | empty container days; trailer shuttle | I: L0-203, L0-211, L0-217 |
| L0-232 | Transportation | Empty-distance share | Proportion of mobile-asset distance travelled without revenue or required payload. | deadhead miles; ballast leg | D: L0-206, L0-222; I: L0-216, L0-380 |
| L0-233 | Cargo | In-transit cargo-damage rate | Proportion of shipped units damaged between transport origin and destination. | broken freight; shock damage | I: L0-039, L0-220, L0-225 |
| L0-234 | Cargo | In-transit temperature conformance | Proportion of transit time cargo remains within its specified temperature range. | 2–8°C compliance; excursion mins | D: L0-213, L0-318; I: L0-026, L0-233 |
| L0-235 | Cargo | Cargo-theft rate | Frequency or value of cargo theft per shipment or exposure unit. | incidents/1,000 loads; value loss | I: L0-024, L0-354, L0-355 |
| L0-236 | Transportation | Detention time | Time transport equipment waits beyond the allowed loading or unloading period. | truck hours; container days | D: L0-181, L0-248; I: L0-216, L0-227 |
| L0-237 | Transportation | Demurrage charge | Monetary charge for retaining transport equipment or cargo beyond free time. | $/container-day; wagon fee | D: L0-236, L0-216; I: L0-292, L0-299 |
| L0-238 | Transportation | Freight-document accuracy | Proportion of transport documents correct, complete, and consistent with cargo. | bill of lading; air waybill | D: L0-154, L0-314; I: L0-225, L0-260 |
| L0-239 | Transportation | Shipment-tracking coverage | Proportion of shipments producing usable location and status events. | GPS loads; parcel scans | D: L0-319, L0-320; I: L0-227, L0-325 |
| L0-240 | Transportation | Transport-emissions intensity | Greenhouse-gas emissions per unit of freight activity. | gCO2e/tonne-km; per parcel | D: L0-224, L0-206; I: L0-376, L0-382 |

### K. Logistics nodes, public infrastructure, and border operations

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-241 | Port | Port-congestion level | Degree to which demand for port resources exceeds timely service capacity. | vessels at anchor; congestion index | D: L0-242, L0-243; I: L0-225, L0-229 |
| L0-242 | Port | Berth availability | Number of compatible berth-time slots available to arriving vessels. | berths/day; berth window | I: L0-209, L0-241, L0-244 |
| L0-243 | Port | Port-handling capacity | Maximum cargo volume a port can receive, transfer, and dispatch in a period. | TEU/day; tonnes/hour | D: L0-244, L0-245; I: L0-202, L0-241 |
| L0-244 | Terminal | Cargo-handling-equipment availability | Quantity of cranes, loaders, pumps, or specialized terminal equipment ready for use. | quay cranes; grain unloaders | D: L0-088; I: L0-243, L0-248 |
| L0-245 | Terminal | Terminal-labor availability | Qualified terminal labor-hours accessible for scheduled cargo operations. | gangs/shift; ground handlers | D: L0-101, L0-102; I: L0-243, L0-248 |
| L0-246 | Port | Port-cargo dwell time | Elapsed time cargo remains in a port from discharge or receipt to onward release. | container days; bulk hours | D: L0-241, L0-260; I: L0-218, L0-237 |
| L0-247 | Port | Navigable-channel availability | Time and capacity for vessels to use a channel under depth, weather, and control constraints. | tide window; draft limit | I: L0-209, L0-223, L0-241 |
| L0-248 | Terminal | Terminal-gate throughput | Number of vehicles, loads, or containers processed through a terminal gate per time. | trucks/hour; boxes/day | D: L0-245, L0-263; I: L0-198, L0-236 |
| L0-249 | Rail infrastructure | Rail-terminal capacity | Maximum rail cargo or train volume a terminal can process in a period. | trains/day; wagons/hour | I: L0-207, L0-228, L0-253 |
| L0-250 | Airport | Airport cargo-handling capacity | Maximum air-cargo volume an airport can accept, process, and release in a period. | tonnes/day; ULDs/hour | D: L0-245; I: L0-212, L0-230 |
| L0-251 | Airport | Cargo-slot availability | Number of compatible airport movement and handling slots available for cargo. | freighter slots; ULD windows | I: L0-212, L0-230, L0-250 |
| L0-252 | Road infrastructure | Road-condition rating | Assigned physical condition of road infrastructure relevant to safe freight movement. | pavement score; seasonal class | I: L0-218, L0-220, L0-233 |
| L0-253 | Rail infrastructure | Rail-network availability | Proportion of required rail network paths open and serviceable. | lines open; outage km | I: L0-208, L0-218, L0-228 |
| L0-254 | Waterway infrastructure | Waterway navigability | Current ability of an inland waterway to support assigned vessel dimensions and loads. | river depth; lock open | I: L0-209, L0-210, L0-223 |
| L0-255 | Infrastructure | Bridge load limit | Maximum authorized gross or axle load for a bridge crossing. | tonnes; axle class | I: L0-205, L0-223, L0-252 |
| L0-256 | Infrastructure | Tunnel-clearance limit | Maximum vehicle or cargo envelope permitted through a tunnel. | height; width; loading gauge | I: L0-038, L0-205, L0-223 |
| L0-257 | Infrastructure | Refuelling-point availability | Number and throughput of compatible fuel points accessible on a route. | truck stops; bunker berths | D: L0-123; I: L0-203, L0-209, L0-224 |
| L0-258 | Infrastructure | Charging-point availability | Number and power of compatible vehicle charging points accessible on a route. | chargers; MW/site | D: L0-121; I: L0-203, L0-224, L0-377 |
| L0-259 | Border | Border-crossing capacity | Maximum vehicles, passengers, or cargo units processable through a crossing per period. | trucks/day; lanes open | D: L0-260, L0-262; I: L0-218, L0-225 |
| L0-260 | Border | Customs-clearance time | Elapsed time from customs submission or arrival to customs release. | hours; days | D: L0-238, L0-405, L0-406, L0-407; I: L0-218, L0-246 |
| L0-261 | Border | Border-queue length | Number of vehicles, people, or cargo units awaiting border processing. | trucks; containers; travellers | D: L0-202, L0-259; I: L0-225, L0-260 |
| L0-262 | Border | Border-inspection rate | Proportion of border movements selected for physical or documentary inspection. | scan rate; secondary checks | I: L0-259, L0-260, L0-403 |
| L0-263 | Infrastructure | Node operating hours | Time windows during which a logistics node accepts and processes work. | 24/7; weekday gate | I: L0-181, L0-243, L0-259 |
| L0-264 | Infrastructure | Node telecommunications availability | Network connectivity capacity available for node operations and data exchange. | mobile coverage; fibre uptime | I: L0-315, L0-320, L0-248 |

### L. Order management, fulfilment, distribution, and reverse logistics

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-265 | Order management | Order-capture accuracy | Proportion of orders recorded with correct customer, item, quantity, price, and destination. | error-free orders; EDI accuracy | D: L0-314, L0-316; I: L0-267, L0-270 |
| L0-266 | Order management | Order-entry latency | Elapsed time from customer submission to order availability for processing. | API milliseconds; manual hours | D: L0-315, L0-316; I: L0-267, L0-269 |
| L0-267 | Order management | Order-backlog quantity | Number or volume of accepted order lines not yet fulfilled. | open lines; unserved cases | D: L0-001, L0-156; I: L0-187, L0-269 |
| L0-268 | Order management | Order-priority class | Assigned service priority used to sequence constrained supply or capacity. | emergency; premium; standard | D: L0-008, L0-025; I: L0-157, L0-267 |
| L0-269 | Order management | Order-processing time | Elapsed time from valid order entry to release for physical fulfilment. | minutes; approval days | D: L0-265, L0-302; I: L0-247, L0-267 |
| L0-270 | Fulfilment | Customer-order lead time | Elapsed time from valid customer order to completed delivery or service. | click-to-door; request-to-care | D: L0-269, L0-218, L0-278; I: L0-009, L0-146 |
| L0-271 | Fulfilment | Order fill rate | Proportion of ordered quantity fulfilled from available supply at first commitment. | unit fill; line fill | D: L0-156, L0-267; I: L0-008, L0-146 |
| L0-272 | Fulfilment | Complete-order rate | Proportion of orders delivered with all requested lines and quantities. | in-full rate; complete kit | D: L0-271, L0-278; I: L0-146, L0-391 |
| L0-273 | Fulfilment | Split-shipment rate | Proportion of orders fulfilled through more than one shipment or service event. | partial parcels; staged delivery | D: L0-156, L0-217; I: L0-270, L0-292 |
| L0-274 | Fulfilment | Fulfilment-capacity availability | Quantity of pick, pack, stage, and dispatch capacity available in a stated period. | orders/day; cases/hour | D: L0-180, L0-188, L0-191; I: L0-267, L0-271 |
| L0-275 | Fulfilment | Delivery-promise accuracy | Agreement between promised and realistically achievable delivery date or window. | available-to-promise accuracy; ETA error | D: L0-156, L0-219, L0-325; I: L0-227, L0-270 |
| L0-276 | Distribution | Distribution-centre allocation share | Proportion of demand assigned to each fulfilment or distribution node. | 60% east DC; ship-from-store | I: L0-176, L0-217, L0-429 |
| L0-277 | Last mile | Delivery-stop density | Number of delivery stops per unit of route distance or area. | stops/km; drops/zone | I: L0-206, L0-222, L0-292 |
| L0-278 | Last mile | First-attempt delivery success rate | Proportion of deliveries completed on the first attempted visit or handoff. | home delivery; service visit | I: L0-265, L0-270, L0-277 |
| L0-279 | Last mile | Proof-of-delivery availability | Proportion of completed deliveries with valid receipt evidence. | signature; photo; scan | D: L0-320; I: L0-227, L0-270 |
| L0-280 | Reverse logistics | Return rate | Proportion of delivered units or orders returned by customers or users. | returns/sales; reusable tote return | I: L0-146, L0-150, L0-281 |
| L0-281 | Reverse logistics | Return-reason accuracy | Proportion of returns assigned a correct and actionable reason code. | defect; fit; overage | D: L0-314, L0-320; I: L0-280, L0-283 |
| L0-282 | Reverse logistics | Return-transit time | Elapsed time from return authorization or collection to receiving location. | customer-to-depot days; recall pickup | D: L0-217, L0-218; I: L0-165, L0-283 |
| L0-283 | Reverse logistics | Return-disposition time | Elapsed time from returned-item receipt to final disposition decision. | restock; repair; recycle | D: L0-136, L0-281; I: L0-164, L0-284 |
| L0-284 | Reverse logistics | Recoverable-value share | Proportion of returned product value recoverable through reuse, repair, refurbishment, resale, or recycling. | resale yield; core value | D: L0-283, L0-286, L0-386; I: L0-296, L0-312 |
| L0-285 | Reverse logistics | Repair-capacity availability | Quantity of qualified repair resources accessible in a stated period. | units/day; technicians/shift | D: L0-098, L0-100; I: L0-283, L0-284 |
| L0-286 | Reverse logistics | Refurbishment yield | Proportion of returned units restored to an approved reusable condition. | remanufactured units; device recovery | D: L0-285; I: L0-284, L0-389 |

### M. Cost, cash, credit, insurance, and commercial finance

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-287 | Finance | Cash balance | Unrestricted cash available to fund current obligations. | bank balance; treasury liquidity | I: L0-288, L0-298, L0-305 |
| L0-288 | Finance | Operating-cash outflow rate | Cash paid for operations per unit of time. | $/week; payroll burn | D: L0-061, L0-104, L0-292; I: L0-287 |
| L0-289 | Finance | Customer-payment term | Contracted elapsed time and conditions for customer payment. | net 30; prepayment | I: L0-291, L0-300, L0-419 |
| L0-290 | Finance | Supplier-payment term | Contracted elapsed time and conditions for supplier payment. | net 60; milestone pay | I: L0-050, L0-292, L0-300 |
| L0-291 | Finance | Accounts-receivable age | Elapsed time since a customer invoice became collectible. | DSO buckets; overdue days | D: L0-289; I: L0-287, L0-298 |
| L0-292 | Cost | Operating cost | Period cost incurred to run a defined process, asset, lane, or facility. | labor; energy; freight | D: L0-104, L0-122, L0-216; I: L0-278, L0-295 |
| L0-293 | Cost | Inventory unit value | Financial value assigned to one unit of inventory under the chosen accounting basis. | standard cost; replacement value | D: L0-061, L0-292; I: L0-173, L0-296 |
| L0-294 | Cost | Cost of capital rate | Required return or financing rate applied to invested working capital and assets. | WACC; hurdle rate | D: L0-301; I: L0-173, L0-427 |
| L0-295 | Cost | Storage cost rate | Cost of storage space, labor, utilities, and services per quantity and time. | $/pallet-month; $/m³ | D: L0-175, L0-180, L0-122; I: L0-173 |
| L0-296 | Cost | Write-down value | Financial value removed because inventory is damaged, expired, obsolete, or unrecoverable. | obsolescence reserve; scrap loss | D: L0-164, L0-165, L0-284; I: L0-312 |
| L0-297 | Finance | Working-capital limit | Maximum funding authorized or available for receivables, inventory, and payables. | revolver size; policy ceiling | D: L0-287, L0-298; I: L0-158, L0-172 |
| L0-298 | Credit | Credit availability | Amount of committed or obtainable borrowing capacity currently accessible. | undrawn facility; trade credit | D: L0-301, L0-303; I: L0-287, L0-297 |
| L0-299 | Cost | Landed unit cost | Total assigned cost per unit at a destination, including purchase, logistics, duty, and handling. | delivered $/kg; import cost | D: L0-061, L0-216, L0-237, L0-413; I: L0-011 |
| L0-300 | Finance | Cash-conversion duration | Elapsed time between paying for supply inputs and collecting cash from customers. | cash-to-cash days; working-capital cycle | D: L0-166, L0-289, L0-290; I: L0-287, L0-297 |
| L0-301 | Finance | Interest rate | Price of borrowing or return on a reference financial instrument. | SOFR spread; policy rate | I: L0-294, L0-298, L0-460 |
| L0-302 | Currency | Exchange rate | Price of one currency expressed in another at a point in time. | USD/INR; EUR/GBP | I: L0-061, L0-216, L0-299 |
| L0-303 | Currency | Exchange-rate volatility | Dispersion or change rate of an exchange rate over a defined horizon. | 30-day volatility; devaluation | D: L0-302; I: L0-298, L0-312 |
| L0-304 | Credit | Customer-default rate | Proportion of customer obligations not paid as contracted. | bad-debt rate; missed instalments | I: L0-287, L0-291, L0-298 |
| L0-305 | Credit | Supplier-default status | Current inability or failure of a supplier to perform financial or delivery obligations. | insolvency; missed shipment | D: L0-050; I: L0-030, L0-287 |
| L0-306 | Insurance | Insurance-coverage limit | Maximum insured value recoverable for a defined peril and scope. | cargo limit; property limit | I: L0-024, L0-309, L0-328 |
| L0-307 | Insurance | Insurance-premium rate | Price of insurance per unit of exposure or insured value. | basis points; $/shipment | D: L0-306, L0-309; I: L0-292 |
| L0-308 | Insurance | Insurance-deductible | Loss amount retained before insurance recovery applies. | $100k; 2% cargo value | I: L0-306, L0-312, L0-328 |
| L0-309 | Insurance | Insured-peril coverage | Set of loss causes explicitly included in an insurance policy. | flood; cyber; cargo theft | I: L0-306, L0-348, L0-393 |
| L0-310 | Insurance | Claim-settlement time | Elapsed time from complete claim submission to final payment or closure. | days; months | I: L0-287, L0-306, L0-328 |
| L0-311 | Finance | Capital-budget availability | Amount of approved funding accessible for supply-chain assets or change initiatives. | automation budget; new DC capex | I: L0-059, L0-129, L0-427 |
| L0-312 | Finance | Supply-chain margin | Selling price less assigned supply-chain cost per unit or order. | contribution/unit; route margin | D: L0-011, L0-299; I: L0-303, L0-460 |

### N. Data, software, visibility, communication, planning, and decisions

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-313 | Data | Master-data completeness | Proportion of required master-data fields populated for in-scope records. | item fields; supplier attributes | I: L0-314, L0-316, L0-342 |
| L0-314 | Data | Master-data accuracy | Proportion of master-data values matching verified real-world or governed sources. | unit of measure; address | D: L0-313; I: L0-070, L0-265 |
| L0-315 | Software | System availability | Proportion of required time an application or platform can perform its intended function. | ERP uptime; WMS availability | D: L0-344; I: L0-266, L0-333 |
| L0-316 | Integration | Interface availability | Proportion of required time a data interface can accept and deliver transactions. | API endpoint; EDI gateway | D: L0-315; I: L0-265, L0-333 |
| L0-317 | Integration | Integration latency | Elapsed time from a source event to usable receipt in the consuming system. | API milliseconds; batch hours | D: L0-316, L0-321; I: L0-328, L0-345 |
| L0-318 | Sensing | Sensor coverage | Proportion of relevant assets, conditions, or process points monitored by suitable sensors. | temperature probes; vibration tags | I: L0-094, L0-142, L0-199 |
| L0-319 | Identification | Unique-identifier coverage | Proportion of items, lots, assets, or locations carrying a usable unique identifier. | barcode; RFID; serial | I: L0-151, L0-320, L0-355 |
| L0-320 | Visibility | Event-capture completeness | Proportion of required physical or transactional events recorded with required fields. | shipment scans; genealogy events | D: L0-318, L0-319; I: L0-151, L0-239 |
| L0-321 | Data | Data latency | Elapsed time between a real-world state change and its availability to a user or model. | seconds; daily refresh | D: L0-317, L0-320; I: L0-275, L0-328 |
| L0-322 | Visibility | Order-status accuracy | Agreement between reported and actual order state, quantity, and expected timing. | open; shipped; delivered | D: L0-265, L0-320; I: L0-275, L0-345 |
| L0-323 | Planning | Forecast-update frequency | Number of formal or system forecast refreshes per unit of time. | daily; monthly cycle | I: L0-016, L0-324, L0-328 |
| L0-324 | Planning | Planning horizon | Future time span explicitly represented in a plan or forecast. | 13 weeks; ten years | I: L0-019, L0-064, L0-426 |
| L0-325 | Visibility | Supply-visibility depth | Number of upstream and downstream tiers or event stages visible at usable quality. | tier 3; source-to-customer | D: L0-056, L0-320; I: L0-329, L0-370 |
| L0-326 | Analytics | Predictive-model error | Difference between predicted and realized values for a defined model and horizon. | ETA MAE; failure false negatives | D: L0-321; I: L0-275, L0-327 |
| L0-327 | Planning | Planning-scenario count | Number of materially distinct scenarios evaluated for a decision cycle. | base/upside/downside; disruption cases | I: L0-329, L0-330, L0-397 |
| L0-328 | Planning | Replanning latency | Elapsed time from a material signal or disruption to an approved updated plan. | minutes; S&OP days | D: L0-321, L0-331; I: L0-267, L0-365 |
| L0-329 | Planning | Scenario-variable coverage | Proportion of decision-relevant uncertain variables represented in scenarios. | demand; capacity; FX; climate | D: L0-325, L0-370; I: L0-327, L0-397 |
| L0-330 | Analytics | Optimization-engine availability | Proportion of required time an optimization or decision engine can execute valid runs. | APS solver; routing engine | D: L0-315; I: L0-327, L0-328 |
| L0-331 | Decision | Decision-approval time | Elapsed time from decision-ready recommendation to authorized action. | expedite approval; S&OP sign-off | I: L0-069, L0-328, L0-436 |
| L0-332 | Planning | Plan-stability rate | Proportion of planned orders, dates, or allocations unchanged inside a stated frozen window. | schedule nervousness; frozen-zone adherence | I: L0-078, L0-328, L0-391 |
| L0-333 | Integration | API-transaction success rate | Proportion of attempted API transactions completed with correct acknowledged outcomes. | 2xx success; no duplicate order | D: L0-315, L0-316; I: L0-265, L0-322 |
| L0-334 | Integration | EDI-message success rate | Proportion of expected EDI messages transmitted, received, parsed, and acknowledged correctly. | ASN success; invoice acknowledgment | D: L0-316; I: L0-070, L0-265 |
| L0-335 | Connectivity | Supplier digital-connectivity coverage | Proportion of suppliers exchanging required data through supported digital channels. | portal users; EDI suppliers | D: L0-316; I: L0-056, L0-325 |
| L0-336 | Connectivity | Customer digital-connectivity coverage | Proportion of customers exchanging orders and status through supported digital channels. | API customers; portal accounts | D: L0-316; I: L0-265, L0-322 |
| L0-337 | Digital model | Digital-twin fidelity | Agreement between a digital representation and the current physical network state and behavior. | inventory match; simulated throughput | D: L0-320, L0-326; I: L0-327, L0-428 |
| L0-338 | Analytics | Algorithm-explainability level | Degree to which model outputs can be interpreted and justified for their intended decision. | feature attribution; reason codes | I: L0-326, L0-339, L0-417 |
| L0-339 | Automation | Automated-decision share | Proportion of eligible operational decisions executed without human approval. | auto-replenishment; dynamic routing | D: L0-330, L0-341; I: L0-328, L0-436 |
| L0-340 | Automation | Manual-override rate | Proportion of automated recommendations or actions altered by a human user. | planner overrides; robot bypass | D: L0-339; I: L0-326, L0-397 |
| L0-341 | Data governance | Data-access authorization coverage | Proportion of data resources governed by approved role or policy-based access. | RBAC coverage; consent state | I: L0-352, L0-417, L0-441 |
| L0-342 | Data governance | Data-retention conformance | Proportion of records retained and disposed according to approved rules. | seven-year archive; deletion SLA | D: L0-313; I: L0-364, L0-419 |
| L0-343 | Data protection | Backup completion rate | Proportion of scheduled data or configuration backups completed and verified. | nightly backup; immutable copy | I: L0-315, L0-364, L0-365 |
| L0-344 | Software | Software-version currency | Degree to which deployed software remains within supported and approved versions. | supported ERP; current firmware | I: L0-315, L0-347, L0-353 |
| L0-345 | Communication | Operational-response time | Elapsed time from a valid operational message to accountable acknowledgement or action. | supplier alert; incident page | D: L0-317; I: L0-147, L0-368 |
| L0-346 | Interoperability | Semantic-interoperability score | Degree to which systems exchange data with consistent meaning and identifiers. | shared units; canonical events | D: L0-313, L0-314; I: L0-316, L0-325 |

### O. Physical security, cybersecurity, continuity, and recovery

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-347 | Cybersecurity | Open-vulnerability count | Number of known unremediated security weaknesses in the in-scope environment. | critical CVEs; control gaps | D: L0-344; I: L0-348, L0-353 |
| L0-348 | Cybersecurity | Cyber-incident rate | Number of confirmed cybersecurity incidents per exposure period. | ransomware; account takeover | D: L0-347, L0-352; I: L0-315, L0-365 |
| L0-349 | Cybersecurity | Phishing-compromise rate | Proportion of tested or real phishing attempts resulting in credential or action compromise. | test click-plus-submit; BEC | I: L0-348, L0-352, L0-357 |
| L0-350 | Cybersecurity | Threat-detection time | Elapsed time from malicious activity start to detection. | MTTD; alert latency | D: L0-348, L0-369; I: L0-351, L0-365 |
| L0-351 | Cybersecurity | Threat-containment time | Elapsed time from detection to effective containment of a cyber threat. | isolation minutes; MTTC | D: L0-350, L0-369; I: L0-315, L0-365 |
| L0-352 | Cybersecurity | Access-control coverage | Proportion of users, systems, and resources governed by approved access controls. | MFA; RBAC; network segmentation | D: L0-341; I: L0-348, L0-353 |
| L0-353 | Cybersecurity | Security-patch compliance | Proportion of in-scope assets patched within risk-based due dates. | critical within 14 days; firmware | D: L0-344; I: L0-347, L0-348 |
| L0-354 | Physical security | Security-control coverage | Proportion of sites, routes, and assets protected by required physical controls. | CCTV; guards; geofences | I: L0-235, L0-356, L0-358 |
| L0-355 | Cargo security | Cargo-seal integrity rate | Proportion of sealed loads arriving with seal identity and condition intact. | bolt seal; e-seal | D: L0-319; I: L0-235, L0-358 |
| L0-356 | Physical security | Theft-incident rate | Number of inventory, asset, or facility theft incidents per exposure unit. | burglaries/site-year; shrink events | D: L0-354; I: L0-168, L0-235 |
| L0-357 | Personnel security | Personnel-vetting completion | Proportion of in-scope personnel with current required screening. | background checks; license checks | I: L0-349, L0-354, L0-399 |
| L0-358 | Site security | Visitor-control compliance | Proportion of visitor entries following identity, escort, and access rules. | badge checks; escort logs | D: L0-354; I: L0-356, L0-357 |
| L0-359 | Continuity | Alternate-supplier activation time | Elapsed time to place conforming supply from a pre-identified alternate source. | days to first lot; switch SLA | D: L0-043, L0-054; I: L0-030, L0-365 |
| L0-360 | Continuity | Alternate-site capacity | Conforming capacity available at sites other than the primary operating location. | backup plant units/day; remote service seats | D: L0-071, L0-137; I: L0-365, L0-428 |
| L0-361 | Continuity | Alternate-route availability | Number or capacity of viable routes independent of the primary route. | second port; bypass road | D: L0-217, L0-223; I: L0-225, L0-365 |
| L0-362 | Continuity | Emergency-inventory coverage | Time or quantity of protected inventory reserved for defined disruption scenarios. | strategic stock days; emergency kits | D: L0-157, L0-158; I: L0-162, L0-365 |
| L0-363 | Recovery | Recovery-time objective | Maximum targeted duration to restore a process, system, or service after disruption. | four hours; two days | I: L0-365, L0-366, L0-436 |
| L0-364 | Recovery | Recovery-point objective | Maximum targeted age of data or state recoverable after disruption. | 15 minutes; previous shift | D: L0-343; I: L0-365, L0-342 |
| L0-365 | Recovery | Actual restoration time | Elapsed time from disruption to verified restoration of the required service level. | system recovery; line restart | D: L0-351, L0-359, L0-360, L0-361; I: L0-363 |
| L0-366 | Continuity | Continuity-plan coverage | Proportion of critical processes and dependencies covered by approved continuity procedures. | sites; suppliers; applications | D: L0-370; I: L0-365, L0-367 |
| L0-367 | Continuity | Continuity-test frequency | Number of exercises or recovery tests completed per defined period. | annual failover; quarterly drill | D: L0-366; I: L0-365, L0-397 |
| L0-368 | Crisis communication | Emergency-message reach | Proportion of intended recipients receiving and acknowledging a crisis message. | worker alert; supplier notice | D: L0-345; I: L0-365, L0-369 |
| L0-369 | Incident response | Incident-response capacity | Qualified responder-hours and tools available for active incidents. | SOC analysts; emergency team | D: L0-101, L0-102; I: L0-350, L0-351 |
| L0-370 | Risk mapping | Critical-dependency mapping coverage | Proportion of critical products, processes, assets, suppliers, systems, and routes with documented dependencies. | BOM-to-tier map; app-to-site map | D: L0-056, L0-325; I: L0-329, L0-366 |

### P. Environment, circularity, resources, and physical climate exposure

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-371 | Emissions | Scope 1 emissions | Direct greenhouse-gas emissions from owned or controlled sources in a stated period. | onsite fuel; refrigerant leaks | D: L0-123, L0-375; I: L0-376, L0-400 |
| L0-372 | Emissions | Scope 2 emissions | Indirect greenhouse-gas emissions associated with purchased energy in a stated period. | purchased electricity; steam | D: L0-121, L0-132; I: L0-376, L0-400 |
| L0-373 | Emissions | Scope 3 emissions | Value-chain greenhouse-gas emissions outside owned or controlled sources in a stated period. | purchased goods; logistics; use | D: L0-240, L0-374; I: L0-376, L0-410 |
| L0-374 | Emissions | Emissions-factor accuracy | Agreement between applied conversion factors and the best applicable evidence for an activity. | grid factor; fuel factor | I: L0-371, L0-372, L0-373 |
| L0-375 | Resource use | Energy intensity | Energy consumed per unit of conforming output or service. | kWh/unit; GJ/tonne | D: L0-121, L0-123, L0-073; I: L0-292, L0-371 |
| L0-376 | Emissions | Product carbon intensity | Greenhouse-gas emissions assigned per product, service, or functional unit. | kgCO2e/unit; per patient | D: L0-371, L0-372, L0-373; I: L0-011, L0-423 |
| L0-377 | Water | Water-withdrawal volume | Quantity of water taken from surface, groundwater, municipal, or other sources. | m³/day; litres/batch | D: L0-126; I: L0-378, L0-387 |
| L0-378 | Water | Water-consumption volume | Withdrawn water not returned to the same catchment in usable form. | evaporated water; product water | D: L0-377; I: L0-387, L0-394 |
| L0-379 | Water | Water-discharge conformance | Degree to which discharged water meets applicable quality and permit limits. | COD; pH; temperature | D: L0-391; I: L0-389, L0-400 |
| L0-380 | Waste | Waste-generation quantity | Mass or volume of waste produced by an activity in a stated period. | tonnes/month; packaging waste | D: L0-085, L0-201; I: L0-383, L0-385 |
| L0-381 | Waste | Hazardous-waste share | Proportion of total waste classified as hazardous under applicable rules. | solvent waste; clinical waste | D: L0-034, L0-380; I: L0-385, L0-400 |
| L0-382 | Circularity | Recycling rate | Proportion of eligible discarded material processed into secondary material. | metal scrap; paper recovery | D: L0-380, L0-385; I: L0-036, L0-384 |
| L0-383 | Circularity | Reuse rate | Proportion of eligible products or packaging returned to use without material reprocessing. | reusable crates; refurbished tools | D: L0-280, L0-286; I: L0-380, L0-386 |
| L0-384 | Waste | Landfill-diversion rate | Proportion of waste prevented from disposal in landfill through avoidance, reuse, recycling, or recovery. | diversion %; zero-waste status | D: L0-380, L0-382, L0-383; I: L0-400 |
| L0-385 | Waste | Waste-treatment capacity | Quantity of specified waste a compliant treatment system can process in a period. | tonnes/day; wastewater m³/day | D: L0-137; I: L0-380, L0-381 |
| L0-386 | Circularity | Material-recovery yield | Proportion of input to a recovery process converted into specification-grade secondary material. | recycled resin yield; metal recovery | D: L0-382, L0-385; I: L0-036, L0-284 |
| L0-387 | Land | Operational land-use area | Area occupied or materially transformed by supply-chain facilities and activities. | hectares; corridor footprint | I: L0-389, L0-425, L0-429 |
| L0-388 | Land | Deforestation-free status | Current evidence-backed state that an in-scope commodity or site is not linked to prohibited deforestation. | verified; unknown; nonconforming | D: L0-035, L0-325; I: L0-058, L0-400 |
| L0-389 | Biodiversity | Biodiversity-impact score | Assigned magnitude of effect on habitats, species, and ecosystem condition for a defined activity. | habitat score; species risk | D: L0-377, L0-387; I: L0-391, L0-400 |
| L0-390 | Air quality | Air-pollutant emission rate | Quantity of non-greenhouse air pollutants emitted per time or output. | NOx/hour; PM/tonne | D: L0-123, L0-375; I: L0-391, L0-400 |
| L0-391 | Environment | Environmental-permit status | Current validity and conditions of an environmental authorization for an activity or site. | discharge permit; emissions consent | D: L0-379, L0-390; I: L0-137, L0-400 |
| L0-392 | Climate | Ambient-temperature exposure | Frequency, duration, and magnitude of temperatures affecting an asset, route, worker, or product. | heatwave hours; freeze days | I: L0-026, L0-101, L0-223 |
| L0-393 | Climate | Flood exposure | Expected or observed depth, probability, and duration of inundation at an asset or route. | 1-in-100-year depth; closure days | I: L0-223, L0-309, L0-425 |
| L0-394 | Climate | Drought severity | Magnitude and duration of water deficit affecting a source, basin, or operation. | drought index; reservoir level | I: L0-051, L0-126, L0-378 |
| L0-395 | Climate | Storm exposure | Frequency and intensity of wind, precipitation, or surge affecting assets and routes. | cyclone category; storm days | I: L0-223, L0-247, L0-309 |
| L0-396 | Climate | Wildfire exposure | Probability, intensity, and duration of wildfire or smoke affecting assets, routes, and labor. | fire-weather index; closure days | I: L0-101, L0-223, L0-425 |
| L0-397 | Climate | Sea-level exposure | Expected chronic or event-driven effect of sea-level rise on coastal assets and routes. | inundation elevation; erosion rate | I: L0-241, L0-393, L0-425 |
| L0-398 | Climate adaptation | Adaptation-control coverage | Proportion of material physical climate exposures with funded, implemented adaptation controls. | flood barriers; heat plan | D: L0-370, L0-393, L0-394, L0-395; I: L0-365 |

### Q. Law, regulation, taxes, trade policy, and market access

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-399 | Labor law | Labor-law compliance status | Current conformance state against applicable wage, hour, safety, and employment rules. | compliant; investigation; breach | D: L0-104, L0-107, L0-114; I: L0-137, L0-403 |
| L0-400 | Environmental law | Environmental-law compliance status | Current conformance state against applicable environmental duties, limits, and reporting rules. | compliant; notice; consent breach | D: L0-379, L0-384, L0-391; I: L0-137 |
| L0-401 | Trade control | Import-license status | Current authorization to import a defined product into a jurisdiction. | valid; quota-limited; expired | I: L0-260, L0-409, L0-421 |
| L0-402 | Trade control | Export-license status | Current authorization to export a defined product, service, or technology. | granted; pending; denied | I: L0-260, L0-403, L0-420 |
| L0-403 | Sanctions | Sanctions-screening result | Current match disposition for a transaction, party, product, vessel, or destination. | cleared; potential match; blocked | D: L0-404; I: L0-401, L0-402 |
| L0-404 | Trade control | Restricted-party screening coverage | Proportion of required parties and transactions screened against applicable restrictions. | customers; banks; vessels | D: L0-313, L0-341; I: L0-403, L0-417 |
| L0-405 | Customs | Tariff-classification accuracy | Proportion of traded items assigned the correct customs classification. | HS code; Schedule B | D: L0-314; I: L0-260, L0-410 |
| L0-406 | Customs | Customs-valuation accuracy | Proportion of customs entries using a correct declared valuation basis and adjustments. | transaction value; assists | D: L0-299, L0-314; I: L0-260, L0-413 |
| L0-407 | Customs | Origin-document completeness | Proportion of shipments with required, valid country-of-origin evidence. | supplier declaration; certificate | D: L0-035, L0-154; I: L0-260, L0-408 |
| L0-408 | Trade policy | Rules-of-origin qualification status | Current determination that a product meets a trade agreement's origin rule. | originating; non-originating | D: L0-028, L0-035, L0-407; I: L0-410, L0-413 |
| L0-409 | Trade policy | Import-quota availability | Remaining quantity or value authorized under an applicable import quota. | tonnes remaining; license units | I: L0-030, L0-401, L0-410 |
| L0-410 | Trade policy | Tariff rate | Customs duty percentage or specific rate applicable to an imported item. | 5% ad valorem; $/kg | D: L0-405, L0-408; I: L0-299, L0-413 |
| L0-411 | Trade remedy | Trade-remedy duty rate | Additional antidumping, countervailing, or safeguard duty applicable to a traded item. | 18% AD duty; safeguard levy | I: L0-299, L0-410, L0-413 |
| L0-412 | Tax | Indirect-tax rate | VAT, GST, sales, excise, or similar tax rate applicable to a transaction. | 18% GST; fuel excise | I: L0-011, L0-061, L0-299 |
| L0-413 | Customs | Duty amount | Monetary customs and trade-remedy duty payable for a shipment or unit. | $/entry; $/unit | D: L0-406, L0-410, L0-411; I: L0-299, L0-312 |
| L0-414 | Regulation | Regulatory-change frequency | Number of material rule changes affecting scope in a stated period. | notices/year; standard revisions | I: L0-415, L0-421, L0-436 |
| L0-415 | Regulation | Regulatory-implementation lead time | Time between publication or certainty of a rule and required compliance. | 90 days; two years | D: L0-414; I: L0-019, L0-147, L0-311 |
| L0-416 | Regulation | Government-permit processing time | Elapsed time from complete application to government permit decision. | site permit; transport license | I: L0-137, L0-152, L0-421 |
| L0-417 | Data law | Privacy-compliance status | Current conformance state against applicable personal-data and privacy obligations. | consent valid; breach; compliant | D: L0-341, L0-342; I: L0-336, L0-404 |
| L0-418 | Data law | Data-localization constraint | Required jurisdiction or boundary within which specified data must be stored or processed. | in-country hosting; regional tenancy | I: L0-315, L0-317, L0-425 |
| L0-419 | Commercial law | Contract-enforceability rating | Assigned likelihood that contractual rights can be timely enforced in a jurisdiction. | court efficiency; arbitration access | I: L0-064, L0-289, L0-305 |
| L0-420 | Intellectual property | Intellectual-property protection status | Current validity and practical enforceability of relevant patent, trade-secret, copyright, or design rights. | patent active; weak enforcement | I: L0-059, L0-402, L0-472 |
| L0-421 | Market access | Product-market authorization status | Current legal permission for a product or service to be offered in a specified market. | drug approval; type certificate | D: L0-152, L0-154; I: L0-001, L0-416 |
| L0-422 | Transport law | Cabotage restriction | Degree to which foreign carriers are restricted from domestic transport movements. | domestic-leg ban; waiver | I: L0-214, L0-217, L0-216 |
| L0-423 | Public procurement | Government-procurement restriction | Eligibility, preference, or content rule governing sales to public buyers. | domestic preference; set-aside | D: L0-060, L0-421; I: L0-001, L0-376 |

### R. Network design, policy, governance, collaboration, and operating model

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-424 | Network design | Facility count | Number of operating or planned physical service, production, storage, or transfer facilities. | plants; DCs; labs; stores | I: L0-429, L0-431, L0-443 |
| L0-425 | Network design | Facility location | Geographic coordinates or assigned service area of a facility. | city; geocode; catchment | I: L0-014, L0-222, L0-393 |
| L0-426 | Network design | Facility-role assignment | Defined primary functions and products assigned to a facility. | make; store; repair; cross-dock | I: L0-071, L0-175, L0-433 |
| L0-427 | Governance | Capital-allocation priority | Ranked priority assigned to a proposed supply-chain investment. | safety first; automation rank | D: L0-294, L0-311; I: L0-398, L0-444 |
| L0-428 | Network design | Network redundancy ratio | Proportion of critical demand that can be served by independent alternate capacity. | dual-site coverage; N+1 | D: L0-359, L0-360, L0-361; I: L0-365 |
| L0-429 | Network design | Node throughput capacity | Maximum conforming inbound, processing, and outbound volume of a network node. | orders/day; tonnes/hour | D: L0-071, L0-175, L0-274; I: L0-276, L0-428 |
| L0-430 | Facility design | Internal-layout travel distance | Average or critical path distance among internal receiving, storage, process, and dispatch points. | metres/order; dock-to-line | D: L0-195; I: L0-194, L0-201 |
| L0-431 | Network design | Active-lane count | Number of distinct origin-destination-mode lanes used in the network. | trade lanes; delivery zones | D: L0-424, L0-425; I: L0-214, L0-361 |
| L0-432 | Network design | Sourcing-allocation share | Proportion of item or category demand assigned to each supply source. | 70/30 split; regional source | D: L0-043, L0-052; I: L0-051, L0-428 |
| L0-433 | Network design | Production-allocation share | Proportion of product demand assigned to each production site or process. | plant split; cloud region share | D: L0-071, L0-426; I: L0-078, L0-428 |
| L0-434 | Network design | Inventory-echelon count | Number of stocking stages between supply origin and final demand. | factory-DC-store; hub-spoke | I: L0-155, L0-270, L0-300 |
| L0-435 | Network design | Decoupling-point location | Network stage at which forecast-driven flow changes to order-driven flow. | finished goods; module; raw stock | I: L0-016, L0-021, L0-158 |
| L0-436 | Governance | Decision-right clarity | Degree to which decision authority, escalation, and accountability are unambiguous. | RACI score; delegated limits | I: L0-069, L0-331, L0-365 |
| L0-437 | Governance | Policy-adherence rate | Proportion of in-scope operational decisions or actions conforming to approved policy. | sourcing rules; inventory limits | I: L0-154, L0-340, L0-438 |
| L0-438 | Performance management | KPI target value | Approved desired value and time horizon for a supply-chain performance measure. | 98% OTD; 30 days stock | I: L0-008, L0-158, L0-227 |
| L0-439 | Planning governance | Planning cadence | Scheduled frequency of a formal planning and reconciliation process. | weekly S&OE; monthly S&OP | I: L0-323, L0-328, L0-331 |
| L0-440 | Collaboration | Partner-collaboration frequency | Number of structured information or decision exchanges with partners per period. | supplier reviews; CPFR cycle | I: L0-053, L0-335, L0-345 |
| L0-441 | Collaboration | Shared-data authorization status | Current permission for specified data to be exchanged with a named partner and purpose. | consented; contract covered | D: L0-341, L0-417; I: L0-325, L0-440 |
| L0-442 | Supplier relationship | Supplier-relationship maturity score | Assigned level of joint governance, trust, and improvement capability with a supplier. | transactional; strategic | I: L0-053, L0-059, L0-440 |
| L0-443 | Operating model | Outsourced-operation share | Proportion of an operating activity performed by external service providers. | 3PL share; contract manufacturing | I: L0-214, L0-315, L0-419 |
| L0-444 | Risk governance | Resilience-budget availability | Approved funding accessible for risk reduction, buffers, alternatives, and recovery capability. | mitigation capex; contingency reserve | D: L0-287, L0-311; I: L0-359, L0-398 |
| L0-445 | Risk governance | Risk-tolerance threshold | Maximum approved exposure or performance deviation before mandatory action. | days at risk; VaR limit | I: L0-268, L0-329, L0-444 |
| L0-446 | Service design | Service-segmentation rule | Governed rule assigning differentiated service, inventory, and fulfilment policies to demand segments. | criticality tier; premium service | D: L0-008, L0-025; I: L0-157, L0-268 |

### S. Social, demographic, public-health, macroeconomic, geopolitical, and innovation drivers

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-447 | Demography | Population-growth rate | Rate of change in population within a defined market or labor catchment. | annual %; cohort growth | I: L0-001, L0-448, L0-451 |
| L0-448 | Demography | Urbanization rate | Proportion of population living in urban areas and its rate of change. | urban share; city growth | I: L0-014, L0-277, L0-425 |
| L0-449 | Demography | Working-age population | Number of people in the locally defined working-age range. | 15–64 population; regional pool | I: L0-101, L0-451, L0-453 |
| L0-450 | Labor market | Labor-force participation rate | Proportion of working-age population employed or actively seeking work. | participation %; gender gap | D: L0-449; I: L0-101, L0-453 |
| L0-451 | Human capital | Relevant-skill attainment rate | Proportion of a population possessing a defined education, trade, digital, or professional skill. | certified welders; STEM graduates | I: L0-102, L0-109, L0-473 |
| L0-452 | Migration | Net migration flow | Difference between people entering and leaving a geography per period. | workers/year; refugee inflow | I: L0-101, L0-118, L0-449 |
| L0-453 | Labor market | Unemployment rate | Proportion of the labor force without work and actively seeking it. | national rate; local rate | D: L0-450; I: L0-101, L0-454 |
| L0-454 | Labor market | Wage-inflation rate | Rate of change in market compensation for relevant labor. | annual wage growth; contract uplift | I: L0-104, L0-292, L0-460 |
| L0-455 | Market | Consumer-confidence index | Survey-based indicator of household expectations about finances and the economy. | confidence index; sentiment | I: L0-001, L0-004, L0-011 |
| L0-456 | Macroeconomy | Real-output growth rate | Inflation-adjusted rate of change in economic output for a geography. | real GDP growth; sector output | I: L0-001, L0-287, L0-311 |
| L0-457 | Macroeconomy | Commodity-price index | Price level or rate of change for a defined basket of raw materials. | metals index; food index | I: L0-061, L0-062, L0-299 |
| L0-458 | Macroeconomy | Energy-price index | Price level or rate of change for a defined basket of energy commodities. | crude index; gas benchmark | I: L0-122, L0-124, L0-292 |
| L0-459 | Public policy | Immigration-restriction level | Degree to which current rules constrain entry, residence, or work by non-citizens. | visa cap; border entry ban | I: L0-118, L0-452, L0-463 |
| L0-460 | Macroeconomy | General-inflation rate | Rate of change in the broad price level for goods and services. | CPI; PPI | I: L0-011, L0-061, L0-104 |
| L0-461 | Public health | Disease-incidence rate | Number of new cases of a defined disease per population and period. | cases/100k/week; outbreak rate | I: L0-005, L0-105, L0-463 |
| L0-462 | Public health | Healthcare-capacity availability | Quantity of accessible beds, clinicians, diagnostics, or treatment slots. | ICU beds; lab tests/day | D: L0-101, L0-102; I: L0-005, L0-463 |
| L0-463 | Public health | Public-health restriction level | Degree to which health measures constrain movement, gathering, or operations. | quarantine; occupancy cap | D: L0-461; I: L0-101, L0-118, L0-223 |
| L0-464 | Society | Civil-unrest incident rate | Number of protests, riots, or disorder events per geography and period. | events/month; blocked-road days | I: L0-101, L0-223, L0-354 |
| L0-465 | Security environment | Violent-crime rate | Number of violent criminal events per population or exposure unit. | robberies/100k; hijackings | I: L0-235, L0-354, L0-356 |
| L0-466 | Labor relations | Strike-action duration | Time operations are affected by organized labor work stoppages. | strike days; port stoppage hours | D: L0-112; I: L0-101, L0-241 |
| L0-467 | Conflict | Armed-conflict event rate | Number and severity of armed-conflict events in a geography and period. | attacks/month; conflict fatalities | I: L0-223, L0-354, L0-468 |
| L0-468 | Government action | Border-closure status | Current degree to which a border or crossing is closed to relevant flows. | open; partial; closed | D: L0-467, L0-469; I: L0-259, L0-361 |
| L0-469 | Government action | Embargo-or-sanction restriction status | Current prohibition or restriction affecting a country, party, product, service, or payment flow. | export embargo; asset freeze | I: L0-302, L0-403, L0-468 |
| L0-470 | Governance environment | Government-stability index | Assigned likelihood of orderly government continuity and policy implementation. | stability score; transition risk | I: L0-414, L0-419, L0-468 |
| L0-471 | Governance environment | Corruption-exposure rating | Assigned likelihood and consequence of bribery, extortion, or improper influence in an activity. | country score; lane risk | I: L0-260, L0-416, L0-419 |
| L0-472 | Innovation | Research-and-development intensity | Research and development expenditure or effort as a share of revenue, output, or resources. | R&D/revenue; researcher FTE | I: L0-059, L0-311, L0-473 |
| L0-473 | Innovation | Patent-activity rate | Number or growth of relevant patent applications, grants, or citations in a period. | filings/year; citation velocity | D: L0-472; I: L0-420, L0-475 |
| L0-474 | Startup ecosystem | Startup-funding availability | Amount of deployable early- and growth-stage capital available to relevant ventures. | seed capital; venture rounds | I: L0-059, L0-298, L0-475 |
| L0-475 | Technology adoption | Technology-adoption rate | Proportion of eligible organizations, processes, or users actively using a specified technology. | robotics share; e-document use | D: L0-311, L0-451; I: L0-103, L0-339 |

### T. Human rights and community relations

| ID | Category | L0 variable | One-line definition | Examples | Direct dependencies or influences |
| -- | -------- | ----------- | ------------------- | -------- | --------------------------------- |
| L0-476 | Human rights | Human-rights due-diligence coverage | Proportion of in-scope suppliers, sites, workers, and activities covered by current human-rights due diligence. | tier coverage; site assessments | D: L0-056, L0-370; I: L0-058, L0-477 |
| L0-477 | Human rights | Forced-labor screening result | Current evidence-backed determination of forced-labor risk or nonconformance for a defined party, product, site, or source. | cleared; elevated risk; confirmed | D: L0-476; I: L0-057, L0-403, L0-421 |
| L0-478 | Human rights | Child-labor screening result | Current evidence-backed determination of child-labor risk or nonconformance for a defined party, product, site, or source. | cleared; remediation open | D: L0-476; I: L0-057, L0-399, L0-421 |
| L0-479 | Labor rights | Living-wage coverage | Proportion of in-scope workers whose regular compensation meets the applicable governed living-wage benchmark. | site share; supplier workforce share | D: L0-104; I: L0-058, L0-106, L0-442 |
| L0-480 | Community | Community-grievance rate | Number of substantiated community-impact grievances per site, project, or activity and period. | noise complaints; access disputes | I: L0-387, L0-389, L0-391 |
| L0-481 | Community | Community-consultation status | Current completion and consent state of required community engagement for a defined activity or decision. | consultation complete; consent pending | I: L0-416, L0-425, L0-480 |

## 3. Level 1: Operational-grouping catalogue

Constituent ranges are inclusive and identify the principal L0 operating set; shared L0s are repeated only where the process genuinely consumes them.

| ID | Category | L1 operational grouping | One-line definition | Constituent L0 variables | Examples | Dependencies |
| -- | -------- | ----------------------- | ------------------- | ------------------------ | -------- | ------------ |
| L1-001 | Demand and planning | Demand sensing and forecasting | Converts consumption, order, market, and historical signals into governed demand projections. | L0-001–L0-006, L0-012–L0-016, L0-323, L0-324, L0-326 | SKU forecast; patient-demand outlook | Upstream: L1-002, L1-046; downstream: L1-019, L1-010; cross: L1-047 |
| L1-002 | Customer and market | Customer and market management | Manages customer segments, channels, prices, commitments, and market-service requirements. | L0-007–L0-015, L0-265, L0-268, L0-289, L0-446, L0-455 | channel strategy; service tier | Upstream: L1-001, L1-058; downstream: L1-036, L1-037; cross: L1-041 |
| L1-003 | Product | Product portfolio and lifecycle management | Governs product variants, lifecycle states, criticality, substitution, and customization choices. | L0-017–L0-027, L0-152, L0-421 | launch; rationalization; end-of-life | Upstream: L1-002, L1-059; downstream: L1-004, L1-010; cross: L1-054 |
| L1-004 | Product and material | Product, material, and specification management | Defines product structures, material requirements, grades, hazards, origin, and allowable substitutions. | L0-028–L0-036, L0-042, L0-151, L0-154 | BOM; formula; material master | Upstream: L1-003, L1-017; downstream: L1-006, L1-011; cross: L1-054 |
| L1-005 | Packaging | Packaging engineering and supply | Designs, qualifies, sources, and supplies packaging that protects, identifies, handles, and recovers products. | L0-037–L0-042, L0-039, L0-041, L0-191, L0-201 | sterile pack; pallet pattern | Upstream: L1-003, L1-004; downstream: L1-024, L1-030; cross: L1-052 |
| L1-006 | Sourcing | Strategic sourcing | Selects supply markets and allocates demand among sources under cost, capacity, risk, and policy constraints. | L0-043–L0-060, L0-063, L0-432, L0-442 | dual source; local source | Upstream: L1-004, L1-058; downstream: L1-007, L1-008; cross: L1-050, L1-054 |
| L1-007 | Supplier | Supplier qualification and performance management | Qualifies suppliers and manages their quality, delivery, compliance, financial, and innovation performance. | L0-044–L0-059, L0-135, L0-147, L0-153, L0-335, L0-440 | supplier scorecard; CAPA | Upstream: L1-006; downstream: L1-008, L1-009; cross: L1-017, L1-057 |
| L1-008 | Procurement | Procurement and contracting | Converts requirements into authorized orders and contracts with controlled price, terms, quantity, and timing. | L0-061–L0-070, L0-290, L0-314, L0-419 | sourcing event; PO release | Upstream: L1-006, L1-019; downstream: L1-009, L1-042; cross: L1-054 |
| L1-009 | Inbound supply | Inbound supply coordination | Coordinates supplier commitments, inbound transport, receiving appointments, and material availability at consuming nodes. | L0-030, L0-046–L0-048, L0-052, L0-070, L0-159, L0-160, L0-182–L0-184, L0-202, L0-226 | vendor schedule; ASN-to-dock | Upstream: L1-007, L1-008, L1-032; downstream: L1-021, L1-010; cross: L1-046 |
| L1-010 | Production planning | Production planning and control | Translates demand and material availability into feasible capacity, sequence, batch, and release plans. | L0-018, L0-029, L0-030, L0-066–L0-068, L0-071, L0-077–L0-084, L0-332, L0-433 | master schedule; dispatch list | Upstream: L1-001, L1-009, L1-019; downstream: L1-011, L1-014; cross: L1-047 |
| L1-011 | Operations | Manufacturing and service operations | Executes transformation or service processes to produce conforming output at required rate, mix, yield, and cost. | L0-071–L0-086, L0-103, L0-121–L0-128, L0-141–L0-145 | assembly; batch processing; care delivery | Upstream: L1-010, L1-004, L1-016; downstream: L1-018, L1-019; cross: L1-017 |
| L1-012 | Assets | Equipment reliability and maintenance | Maintains asset capacity and condition by managing failures, work, spares, inspections, and restoration. | L0-087–L0-098, L0-100, L0-220 | preventive maintenance; repair | Upstream: L1-013, L1-044; downstream: L1-011, L1-026–L1-029; cross: L1-050 |
| L1-013 | Automation | Automation, robotics, and tooling operations | Provides available tooling and controlled automation for physical and information-processing tasks. | L0-088, L0-094, L0-099, L0-189, L0-318, L0-330, L0-337–L0-340, L0-475 | cobot cell; AGV; auto-replenishment | Upstream: L1-059, L1-045; downstream: L1-011, L1-023, L1-024; cross: L1-049 |
| L1-014 | Workforce | Workforce planning and operations | Ensures correctly skilled, productive, authorized, and scheduled labor is available for operational demand. | L0-101–L0-112, L0-118–L0-120, L0-449–L0-454 | shift roster; skills matrix | Upstream: L1-010, L1-058; downstream: L1-011, L1-021–L1-029; cross: L1-015 |
| L1-015 | Health and safety | Occupational health and safety | Controls worker health, fatigue, hazard exposure, protective equipment, and safety performance. | L0-105, L0-113–L0-117, L0-137, L0-399, L0-461–L0-463 | permit to work; fatigue plan | Upstream: L1-014, L1-004; downstream: all physical operations; cross: L1-051, L1-050 |
| L1-016 | Utilities | Energy, water, and utility management | Secures, meters, backs up, and controls the price, continuity, quality, and capacity of operating utilities. | L0-121–L0-134, L0-375, L0-377–L0-379 | power contract; water system | Upstream: L1-051, L1-058; downstream: L1-011, L1-022, L1-030; cross: L1-050 |
| L1-017 | Quality | Quality assurance and process control | Prevents, detects, investigates, and corrects nonconformance across incoming, in-process, and finished output. | L0-031, L0-049, L0-074, L0-085, L0-086, L0-135–L0-148, L0-153, L0-154 | inspection plan; SPC; CAPA | Upstream: L1-004, L1-007; downstream: L1-018, L1-037; cross: L1-046 |
| L1-018 | Product safety | Product release, safety, recall, and genealogy | Controls product disposition, market authorization, contamination response, traceability, and recall execution. | L0-026, L0-042, L0-144–L0-152, L0-154, L0-280, L0-320, L0-421 | batch release; recall trace | Upstream: L1-017, L1-046, L1-054; downstream: L1-019, L1-037, L1-039 |
| L1-019 | Inventory planning | Inventory policy and replenishment planning | Sets buffer, reorder, allocation, ageing, and replenishment parameters by item and echelon. | L0-005, L0-016, L0-026, L0-046, L0-155–L0-167, L0-173, L0-323, L0-324, L0-434, L0-435, L0-438, L0-445, L0-446 | safety stock; reorder policy | Upstream: L1-001, L1-010, L1-055; downstream: L1-008, L1-020, L1-037; cross: L1-041 |
| L1-020 | Inventory control | Inventory control and accounting | Maintains accurate physical, status, ownership, age, damage, count, and valuation records. | L0-145, L0-155–L0-174, L0-293, L0-296, L0-314, L0-320 | cycle count; quarantine control | Upstream: L1-021, L1-022, L1-046; downstream: L1-019, L1-037; cross: L1-042 |
| L1-021 | Warehouse | Receiving and put-away | Accepts inbound loads, verifies receipts, and places usable material into controlled storage locations. | L0-136, L0-169, L0-180–L0-186, L0-189, L0-201 | unload; receive; put away | Upstream: L1-009, L1-025; downstream: L1-020, L1-022; cross: L1-017 |
| L1-022 | Warehouse | Storage and preservation | Holds inventory in compatible space while preserving identity, condition, security, and environmental conformance. | L0-026, L0-033, L0-034, L0-155, L0-166, L0-175–L0-179, L0-199, L0-200 | ambient store; cold room | Upstream: L1-021, L1-016; downstream: L1-023, L1-024; cross: L1-048, L1-051 |
| L1-023 | Material flow | Internal material movement | Moves material safely and timely among receiving, storage, production, inspection, and dispatch points. | L0-186, L0-189, L0-193–L0-196, L0-201, L0-430 | forklift move; AGV route | Upstream: L1-021, L1-022, L1-013; downstream: L1-011, L1-024; cross: L1-015 |
| L1-024 | Warehouse | Picking, packing, staging, and loading | Converts released demand into accurately picked, protected, packed, staged, and loaded shipments. | L0-037–L0-042, L0-180, L0-187–L0-192, L0-201, L0-265, L0-274 | wave picking; parcel packing | Upstream: L1-020, L1-036; downstream: L1-025, L1-032; cross: L1-005 |
| L1-025 | Yard and gate | Yard, appointment, dock, and gate operations | Controls vehicle arrival, parking, dock allocation, temporary staging, and facility gate flow. | L0-181, L0-182, L0-192, L0-197, L0-198, L0-236, L0-248, L0-263 | dock appointment; yard move | Upstream: L1-009, L1-024; downstream: L1-026–L1-032; cross: L1-033 |
| L1-026 | Road transport | Road freight operations | Plans and executes compliant road movements using compatible vehicles, drivers, routes, fuel, and delivery windows. | L0-123, L0-203–L0-206, L0-214–L0-227, L0-232–L0-240, L0-252, L0-255–L0-258 | truckload; parcel van | Upstream: L1-024, L1-031; downstream: L1-035, L1-038; cross: L1-015 |
| L1-027 | Rail transport | Rail freight operations | Plans and executes freight movements over rail paths, railcars, terminals, and interchanges. | L0-202, L0-207, L0-208, L0-214–L0-228, L0-231–L0-240, L0-249, L0-253, L0-256 | intermodal train; bulk rail | Upstream: L1-024, L1-031; downstream: L1-032, L1-035; cross: L1-034 |
| L1-028 | Maritime transport | Ocean and inland-water freight operations | Plans and executes cargo movements by vessel through ports, waterways, equipment pools, and schedules. | L0-202, L0-209–L0-211, L0-214–L0-227, L0-229, L0-231–L0-247, L0-254, L0-257 | liner service; barge | Upstream: L1-024, L1-031; downstream: L1-033, L1-035; cross: L1-034 |
| L1-029 | Air transport | Air-cargo operations | Plans and executes time-sensitive cargo movements using aircraft capacity, airport slots, and cargo handling. | L0-202, L0-212, L0-214–L0-227, L0-230–L0-240, L0-250, L0-251 | belly cargo; freighter | Upstream: L1-024, L1-031; downstream: L1-035, L1-038; cross: L1-034 |
| L1-030 | Cold chain | Temperature-controlled logistics | Maintains validated temperature conditions across packaging, storage, handling, transport, and handoff. | L0-026, L0-033, L0-039, L0-131, L0-178, L0-199, L0-213, L0-234, L0-318 | vaccines; fresh food | Upstream: L1-005, L1-016; downstream: L1-037, L1-038; cross: L1-017 |
| L1-031 | Transport management | Fleet, carrier, and freight procurement | Secures and manages transport providers, mobile assets, capacity, rates, equipment condition, and service performance. | L0-203–L0-217, L0-220, L0-231, L0-237, L0-422, L0-443 | carrier tender; fleet plan | Upstream: L1-008, L1-032; downstream: L1-026–L1-029; cross: L1-041 |
| L1-032 | Transport planning | Multimodal transport planning and control | Selects, books, monitors, and replans mode, route, capacity, consolidation, and intermodal handoffs. | L0-202, L0-214–L0-240, L0-239, L0-275, L0-330, L0-361 | sea-air; rail-road; route control | Upstream: L1-024, L1-047; downstream: L1-026–L1-035; cross: L1-046 |
| L1-033 | Logistics nodes | Port, airport, rail-terminal, and transfer-node operations | Operates shared cargo nodes by managing slots, labor, equipment, throughput, dwell, and connectivity. | L0-228–L0-230, L0-241–L0-251, L0-263, L0-264 | port terminal; cargo airport | Upstream: L1-027–L1-029; downstream: L1-032, L1-035; cross: L1-014 |
| L1-034 | Infrastructure | Transport infrastructure access management | Assesses and manages road, rail, waterway, bridge, tunnel, energy, and communications constraints on flows. | L0-223, L0-247, L0-252–L0-258, L0-264, L0-361, L0-392–L0-397 | route clearance; charger map | Upstream: L1-053, L1-058; downstream: L1-026–L1-033; cross: L1-055 |
| L1-035 | Cross-border | Customs and border operations | Prepares declarations and controls licensing, inspection, origin, valuation, duty, release, and border queues. | L0-035, L0-238, L0-259–L0-263, L0-401–L0-413 | import entry; border release | Upstream: L1-054, L1-032; downstream: L1-009, L1-037; cross: L1-041 |
| L1-036 | Order management | Customer-order management | Captures, validates, prioritizes, promises, and releases customer orders while managing backlog and status. | L0-006–L0-009, L0-156, L0-265–L0-270, L0-275, L0-322 | order orchestration; promise date | Upstream: L1-002, L1-046; downstream: L1-024, L1-037; cross: L1-019 |
| L1-037 | Fulfilment | Fulfilment and distribution | Allocates inventory and node capacity to complete, consolidate, dispatch, and deliver customer demand. | L0-156–L0-162, L0-187–L0-192, L0-217, L0-227, L0-267–L0-276, L0-429 | DC fulfilment; store replenishment | Upstream: L1-019, L1-020, L1-036; downstream: L1-038, L1-039; cross: L1-032 |
| L1-038 | Last mile | Last-mile delivery and service completion | Completes final delivery or service handoff under route, stop-density, access, proof, and first-attempt constraints. | L0-203–L0-206, L0-218–L0-227, L0-239, L0-270, L0-275, L0-277–L0-279 | home delivery; field service | Upstream: L1-026, L1-029, L1-037; downstream: L1-002, L1-039; cross: L1-046 |
| L1-039 | Reverse logistics | Returns, recall retrieval, and reverse flow | Authorizes, collects, transports, receives, and triages returned, recalled, reusable, or end-of-use items. | L0-150, L0-165, L0-217, L0-218, L0-280–L0-284, L0-320 | customer return; product recall | Upstream: L1-018, L1-038; downstream: L1-040, L1-052; cross: L1-020 |
| L1-040 | Recovery operations | Repair, refurbishment, remanufacture, and recovery | Restores returned items or extracts compliant usable value through repair, refurbishment, and material recovery. | L0-098, L0-100, L0-284–L0-286, L0-383, L0-386 | depot repair; remanufacture | Upstream: L1-039; downstream: L1-019, L1-052; cross: L1-017 |
| L1-041 | Cost management | Supply-chain cost, pricing, and profitability management | Measures and manages purchase, conversion, inventory, logistics, duty, service, and margin economics. | L0-011, L0-024, L0-061, L0-104, L0-122, L0-124, L0-173, L0-216, L0-237, L0-287, L0-288, L0-292–L0-299, L0-312 | landed cost; cost-to-serve | Upstream: all operating L1s; downstream: L1-002, L1-006, L1-055; cross: L1-042 |
| L1-042 | Finance | Working capital, treasury, and credit operations | Funds inventories and operations while managing payment terms, receivables, liquidity, borrowing, currency, and defaults. | L0-050, L0-172, L0-287–L0-305, L0-311, L0-312 | cash-to-cash; supplier finance | Upstream: L1-008, L1-020, L1-041; downstream: all funded operations; cross: L1-043 |
| L1-043 | Insurance | Supply-chain insurance and claims | Structures risk transfer and manages limits, premiums, deductibles, covered perils, and claim recovery. | L0-024, L0-235, L0-306–L0-310, L0-348, L0-356, L0-393–L0-397 | cargo policy; cyber claim | Upstream: L1-048–L1-053; downstream: L1-042, L1-050; cross: L1-041 |
| L1-044 | Data governance | Master data and data governance | Governs the completeness, accuracy, access, retention, semantics, and ownership of decision-critical data. | L0-042, L0-070, L0-151, L0-169, L0-238, L0-265, L0-281, L0-313, L0-314, L0-341, L0-342, L0-346 | item master; data policy | Upstream: operational data owners; downstream: L1-045–L1-047; cross: L1-049 |
| L1-045 | Digital operations | Enterprise systems and integration operations | Operates applications, interfaces, APIs, EDI, connectivity, backups, and supported software versions. | L0-264, L0-315–L0-317, L0-333–L0-336, L0-343, L0-344, L0-346 | ERP-WMS link; partner API | Upstream: L1-044, L1-049; downstream: L1-036, L1-046, L1-047; cross: all digital L1s |
| L1-046 | Visibility | Identification, traceability, and control-tower visibility | Captures and reconciles identifiers, sensor states, events, shipment status, inventory, and multi-tier dependencies. | L0-056, L0-151, L0-169, L0-239, L0-275, L0-318–L0-325, L0-337, L0-370 | genealogy; shipment control tower | Upstream: L1-044, L1-045; downstream: L1-018, L1-032, L1-047; cross: L1-050 |
| L1-047 | Decision support | Integrated planning, analytics, and decision support | Evaluates forecasts, constraints, models, scenarios, optimization, approvals, and replanning across horizons. | L0-016, L0-321–L0-332, L0-337–L0-340, L0-439, L0-445 | S&OP; scenario planning; routing | Upstream: L1-001, L1-046; downstream: L1-010, L1-019, L1-032, L1-055; cross: L1-056 |
| L1-048 | Physical security | Site, personnel, asset, and cargo security | Protects people, inventory, cargo, sites, and access points through physical and procedural controls. | L0-168, L0-235, L0-319, L0-354–L0-358, L0-465 | secure yard; cargo seal | Upstream: L1-058; downstream: L1-022, L1-026–L1-033; cross: L1-050 |
| L1-049 | Cybersecurity | Supply-chain cybersecurity operations | Prevents, detects, contains, and recovers cyber threats across internal and partner-connected technology. | L0-315, L0-341–L0-353, L0-357, L0-369 | patching; SOC; access control | Upstream: L1-044, L1-045; downstream: every digitally dependent L1; cross: L1-050 |
| L1-050 | Continuity | Risk, resilience, continuity, and recovery operations | Maps dependencies and prepares buffers, alternatives, response, communication, and recovery for material disruptions. | L0-025, L0-329, L0-359–L0-370, L0-398, L0-428, L0-444, L0-445 | BCP; alternate route; recovery test | Upstream: all risk signals; downstream: all critical L1s; cross: L1-043, L1-056 |
| L1-051 | Environment | Energy, emissions, water, pollution, and environmental compliance | Measures and controls energy, emissions, water, air pollution, permits, and environmental conformance. | L0-121–L0-134, L0-240, L0-371–L0-379, L0-387–L0-391, L0-400 | carbon accounting; water permit | Upstream: all physical operations; downstream: L1-041, L1-054, L1-055; cross: L1-053 |
| L1-052 | Circularity | Waste, reuse, recycling, and circular-flow management | Prevents, classifies, treats, reuses, recycles, and recovers products, packaging, materials, and waste. | L0-036, L0-041, L0-085, L0-164, L0-165, L0-280–L0-286, L0-380–L0-386 | reusable packaging; closed-loop material | Upstream: L1-003–L1-005, L1-039; downstream: L1-006, L1-041; cross: L1-051 |
| L1-053 | Climate risk | Physical climate-risk and adaptation management | Assesses temperature, flood, drought, storm, wildfire, and sea-level exposure and implements adaptation controls. | L0-126, L0-223, L0-309, L0-370, L0-392–L0-398, L0-425 | flood adaptation; heat plan | Upstream: external climate data; downstream: L1-016, L1-034, L1-050, L1-055; cross: L1-043 |
| L1-054 | Compliance | Regulatory, tax, trade, and market-access management | Maintains compliance with product, labor, environmental, customs, sanctions, tax, privacy, IP, and procurement rules. | L0-035, L0-060, L0-137, L0-152–L0-154, L0-238, L0-259–L0-262, L0-399–L0-423 | export control; product licence | Upstream: L1-058; downstream: every regulated L1; cross: L1-035, L1-044 |
| L1-055 | Network design | Supply-chain network and infrastructure design | Chooses facility roles, locations, capacities, lanes, allocations, echelons, decoupling points, and redundancy. | L0-014, L0-051, L0-175, L0-217, L0-252–L0-258, L0-360, L0-361, L0-424–L0-435 | plant footprint; hub network | Upstream: L1-001, L1-034, L1-047, L1-053; downstream: all execution L1s; cross: L1-041 |
| L1-056 | Governance | Governance, policy, performance, and service design | Sets decision rights, policies, KPIs, planning cadence, risk tolerances, and differentiated service rules. | L0-008, L0-025, L0-268, L0-331, L0-427, L0-436–L0-446 | S&OP governance; KPI tree | Upstream: strategy and L1-047; downstream: all governed L1s; cross: L1-050 |
| L1-057 | Partner model | Partner collaboration and outsourced-operations management | Governs shared data, reviews, trust, service providers, and jointly operated processes across organizations. | L0-053, L0-059, L0-214, L0-335, L0-336, L0-419, L0-440–L0-443 | CPFR; 3PL governance | Upstream: L1-006, L1-044; downstream: L1-007–L1-009, L1-031; cross: L1-049 |
| L1-058 | External sensing | Macroeconomic, societal, health, and geopolitical monitoring | Monitors external economic, demographic, public-health, security, conflict, and government signals relevant to the network. | L0-301–L0-303, L0-392–L0-397, L0-447–L0-471 | country-risk watch; outbreak dashboard | Upstream: external sources; downstream: L1-001, L1-006, L1-047, L1-050, L1-054; cross: L1-044 |
| L1-059 | Innovation | Research, innovation, and technology adoption | Identifies, funds, pilots, industrializes, and scales applicable supplier, startup, and technology capabilities. | L0-059, L0-099, L0-311, L0-337–L0-340, L0-420, L0-451, L0-472–L0-475 | startup pilot; robotics scale-up | Upstream: L1-057, L1-058; downstream: L1-003, L1-012, L1-013, L1-045; cross: L1-056 |
| L1-060 | Human rights | Human-rights and community-relations management | Identifies, prevents, remediates, and reports labor-rights and community impacts across owned and partner operations. | L0-058, L0-104, L0-112–L0-118, L0-399, L0-442, L0-476–L0-481 | worker-rights due diligence; community engagement | Upstream: L1-006, L1-014, L1-058; downstream: L1-007, L1-054, L1-055; cross: L1-056, L1-057 |

## 4. Level 2: Composite-force catalogue

L2 rows are emergent forces, not single KPIs. Their listed drivers are the principal causal or moderating variables and groupings; the impact side shows where the force propagates.

| ID | Category | L2 composite force | One-line definition | Underlying L0/L1 drivers | Examples | Supply-chain dependencies and impacts |
| -- | -------- | ------------------ | ------------------- | ------------------------ | -------- | ------------------------------------- |
| L2-001 | Market | Demand and market volatility | Emergent instability in demand level, mix, timing, channel, price response, and customer behavior. | L0-001–L0-016, L0-019, L0-455, L0-456, L0-460; L1-001, L1-002, L1-058 | promotion spike; rapid mix shift | Creates forecast error and service pressure; affects L1-010, L1-019, L1-031, L1-037, L2-003, L2-008. |
| L2-002 | Supply | Supply scarcity and concentration | Composite constraint created by limited, inflexible, geographically concentrated, or fragile upstream supply. | L0-030, L0-032, L0-043–L0-056, L0-064–L0-068, L0-409, L0-457; L1-006–L1-009 | sole-source API; mineral shortage | Raises prices and lead times; affects L1-010, L1-019, L1-041 and amplifies L2-003, L2-008, L2-027. |
| L2-003 | Capacity | End-to-end capacity pressure | Network-wide tension arising when demand approaches or exceeds available supplier, production, labor, storage, handling, transport, or node capacity. | L0-001, L0-044, L0-071, L0-101, L0-121, L0-138, L0-175, L0-217, L0-243, L0-274, L0-429; L1-007, L1-010–L1-016, L1-021–L1-033 | peak-season overload; surge demand | Produces queues, overtime, delay, quality risk, and price escalation; affects L2-004–L2-008. |
| L2-004 | Flow | Network congestion | Emergent accumulation of work and delay across facilities, yards, corridors, terminals, ports, airports, and borders. | L0-080, L0-176, L0-182, L0-186, L0-187, L0-198, L0-225, L0-228, L0-236, L0-241, L0-246, L0-261; L1-021–L1-035 | port queue; warehouse gridlock | Increases transit variability, cost, inventory, and emissions; affects L1-009, L1-019, L1-032, L1-037, L2-006, L2-008. |
| L2-005 | Operations | Operational reliability | Composite ability of people, assets, utilities, suppliers, systems, and processes to perform consistently as intended. | L0-048, L0-078, L0-088–L0-100, L0-108, L0-127, L0-142, L0-215, L0-227, L0-315, L0-333; L1-007, L1-011–L1-017, L1-045 | stable line; reliable carrier | Governs throughput, yield, schedule and restoration performance; moderates L2-003, L2-006, L2-007, L2-027. |
| L2-006 | Customer | End-to-end service performance | Emergent customer outcome created by availability, promise quality, fulfilment completeness, timeliness, condition, and response. | L0-008, L0-009, L0-146, L0-156, L0-162, L0-218, L0-227, L0-265–L0-279, L0-322; L1-019, L1-024, L1-032, L1-036–L1-038 | OTIF; critical-patient service | Drives retention, demand, working capital, and margin; depends on L2-001–L2-005 and affects L2-008. |
| L2-007 | Quality | Product quality and safety risk | Composite likelihood and consequence of nonconforming, unsafe, contaminated, mislabelled, untraceable, or unauthorized output reaching use. | L0-031, L0-039, L0-042, L0-049, L0-074, L0-135–L0-154, L0-171, L0-201, L0-233, L0-234, L0-421; L1-004, L1-005, L1-017, L1-018, L1-030 | contamination recall; counterfeit escape | Causes harm, recall, shutdown, liability, and trust loss; affects L1-037, L1-039, L2-006, L2-008, L2-019. |
| L2-008 | Economics | Cost inflation and margin pressure | System-wide pressure on unit economics created by input, labor, energy, logistics, tax, financing, inefficiency, and pricing movements. | L0-061, L0-062, L0-104, L0-122, L0-124, L0-173, L0-216, L0-237, L0-292–L0-312, L0-410–L0-413, L0-454, L0-457, L0-458, L0-460; L1-041, L1-042 | freight inflation; margin squeeze | Changes sourcing, inventory, service, and investment decisions; affects L1-002, L1-006, L1-019, L1-055 and L2-009. |
| L2-009 | Finance | Working-capital and liquidity pressure | Composite funding strain produced by inventory, receivable, payable, cash, credit, interest, currency, and operating-cash dynamics. | L0-155, L0-163–L0-173, L0-287–L0-305, L0-311; L1-019, L1-020, L1-042 | cash trapped in stock; credit squeeze | Constrains procurement, buffers, payroll, capex, and recovery; affects L1-008, L1-014, L1-050, L1-059 and amplifies L2-002. |
| L2-010 | Finance | Financial instability and credit contagion | Network disruption arising when customer, supplier, lender, insurer, currency, or market distress propagates across obligations and dependencies. | L0-015, L0-050, L0-064, L0-287, L0-298, L0-301–L0-310, L0-419, L0-456, L0-460; L1-006, L1-042, L1-043, L1-058 | supplier insolvency cascade; FX crisis | Reduces capacity, credit and insurance availability; affects L2-002, L2-008, L2-009, L2-027. |
| L2-011 | Macroeconomy | Macroeconomic conditions | Broad economic environment emerging from output, employment, inflation, rates, currencies, confidence, and fiscal or monetary transmission. | L0-301–L0-303, L0-449–L0-460; L1-002, L1-041, L1-042, L1-058 | recession; high-inflation expansion | Shapes demand, financing, wages, prices, investment and trade; drives L2-001, L2-008–L2-010, L2-012. |
| L2-012 | Markets | Commodity and energy market volatility | Composite instability in material, fuel, electricity, gas, and related financial benchmark availability and pricing. | L0-030, L0-061, L0-062, L0-121–L0-126, L0-301–L0-303, L0-457, L0-458; L1-006, L1-016, L1-041, L1-058 | oil shock; metal-price spike | Alters landed cost, production, transport, hedging and substitution; affects L2-002, L2-008, L2-018. |
| L2-013 | Geopolitics | Geopolitics, conflict, and sanctions | Cross-border force produced by state rivalry, armed conflict, sanctions, embargoes, border action, and political stability. | L0-035, L0-051, L0-060, L0-223, L0-302, L0-403, L0-404, L0-419, L0-467–L0-471; L1-006, L1-032, L1-035, L1-054, L1-058 | war-zone closure; sanctions regime | Blocks parties, routes, payments, technology, and supply; drives L2-002, L2-004, L2-010, L2-014, L2-027. |
| L2-014 | Policy | Trade policy and regulatory complexity | Composite burden and opportunity created by interacting licenses, tariffs, origin rules, remedies, taxes, product rules, data laws, and changing implementation timelines. | L0-060, L0-137, L0-152–L0-154, L0-238, L0-260, L0-399–L0-423; L1-035, L1-044, L1-054 | new tariff regime; privacy localization | Changes market access, lead time, data architecture, cost, and sourcing; affects L1-003, L1-006, L1-032, L1-041, L2-008. |
| L2-015 | Government | Government action and industrial policy | Composite market-shaping force arising from procurement, incentives, local-content rules, permits, restrictions, infrastructure spending, and strategic capacity intervention. | L0-060, L0-311, L0-401, L0-402, L0-409, L0-414–L0-416, L0-423, L0-468–L0-470; L1-006, L1-054, L1-055, L1-058 | reshoring subsidy; export ban | Redirects capital, capacity, technology and network location; affects L2-002, L2-013, L2-014, L2-016, L2-028. |
| L2-016 | Infrastructure | Infrastructure maturity | Composite adequacy, reliability, reach, interoperability, and operating capacity of transport, logistics, energy, water, and telecommunications infrastructure. | L0-121–L0-134, L0-241–L0-264, L0-315–L0-317, L0-425; L1-016, L1-033–L1-035, L1-045, L1-055 | deepwater port ecosystem; weak grid | Determines feasible modes, node capacity, cost, access and reliability; affects L2-003–L2-006, L2-023, L2-027. |
| L2-017 | Climate | Physical climate risk | Composite hazard, exposure, vulnerability, and adaptive-capacity force arising from acute events and chronic climate shifts. | L0-026, L0-033, L0-126, L0-223, L0-309, L0-370, L0-392–L0-398, L0-425; L1-016, L1-034, L1-043, L1-050, L1-053 | flood-disabled port; drought-constrained crop | Damages assets, constrains resources and routes, and alters insurance; affects L2-002–L2-005, L2-009, L2-027. |
| L2-018 | Transition | Decarbonization and energy transition | System change created by carbon constraints, technology shifts, renewable supply, energy economics, asset turnover, and customer or policy pressure. | L0-121–L0-132, L0-224, L0-240, L0-311, L0-371–L0-376, L0-400, L0-410, L0-423, L0-458, L0-475; L1-016, L1-041, L1-051, L1-055, L1-059 | fleet electrification; low-carbon steel | Reconfigures energy, transport, sourcing, products and capital; affects L2-008, L2-012, L2-016, L2-019, L2-023. |
| L2-019 | Sustainability | Sustainability and ESG performance | Composite environmental, social, governance, and economic performance of the network across lifecycle and stakeholder boundaries. | L0-036, L0-041, L0-058, L0-060, L0-113–L0-116, L0-240, L0-371–L0-400, L0-437–L0-445, L0-476–L0-481; L1-015, L1-051–L1-057, L1-060 | responsible supply network; ESG rating | Influences license to operate, capital, demand, compliance, and design; depends on L2-017, L2-018, L2-020, L2-031. |
| L2-020 | Circularity | Circular-economy maturity | Emergent ability of the ecosystem to retain product and material value through design, reverse flows, reuse, repair, remanufacture, and recycling. | L0-027, L0-032, L0-036, L0-041, L0-280–L0-286, L0-380–L0-386, L0-423; L1-003–L1-005, L1-039, L1-040, L1-052 | reusable-loop network; remanufacturing ecosystem | Reduces virgin-resource demand and waste but adds reverse-flow complexity; affects L2-002, L2-008, L2-019, L2-032. |
| L2-021 | Workforce | Workforce transformation | Composite shift in labor demand, skills, location, work design, automation, demographics, mobility, and employment relations. | L0-101–L0-120, L0-339, L0-399, L0-447–L0-454, L0-459, L0-466, L0-475; L1-013–L1-015, L1-058, L1-059 | automation reskilling; aging workforce | Changes capacity, productivity, safety, wages and adoption; affects L2-003, L2-005, L2-008, L2-023, L2-031. |
| L2-022 | Public health | Public-health disruption | Network disruption emerging from disease spread, healthcare capacity, workforce exposure, mobility controls, and behavior change. | L0-001–L0-005, L0-101, L0-105, L0-113, L0-118, L0-461–L0-463; L1-001, L1-014, L1-015, L1-018, L1-058 | pandemic restrictions; regional outbreak | Simultaneously changes demand, labor, borders and service priorities; affects L2-001–L2-006, L2-021, L2-027. |
| L2-023 | Technology | Technology disruption | Structural change caused by rapid emergence, diffusion, substitution, or failure of production, logistics, energy, information, and decision technologies. | L0-059, L0-099, L0-189, L0-258, L0-311, L0-337–L0-340, L0-420, L0-451, L0-472–L0-475; L1-013, L1-045, L1-047, L1-059 | autonomous logistics; generative planning | Alters productivity, skills, network design, cyber exposure and competition; affects L2-016, L2-018, L2-021, L2-024, L2-028. |
| L2-024 | Digital | Digital ecosystem maturity | Composite capability for trusted, timely, interoperable, secure, multi-party data and digitally enabled decisions across the network. | L0-151, L0-239, L0-264, L0-313–L0-346, L0-352, L0-370, L0-441; L1-044–L1-047, L1-049, L1-057 | interoperable control tower; digital trade lane | Improves visibility, automation and response while increasing dependency on systems; affects L2-005–L2-007, L2-014, L2-025, L2-027. |
| L2-025 | Cybersecurity | Systemic cybersecurity risk | Composite likelihood and propagation potential of cyber compromise across connected suppliers, platforms, assets, data, and operations. | L0-264, L0-315–L0-317, L0-335, L0-341–L0-353, L0-357, L0-369, L0-443; L1-045, L1-049, L1-050, L1-057 | ransomware cascade; compromised supplier API | Can halt flows, corrupt decisions, expose data and extend restoration; affects L2-005, L2-006, L2-010, L2-024, L2-027. |
| L2-026 | Security | Physical security, crime, and terrorism risk | Composite exposure to theft, sabotage, violence, organized crime, and hostile acts across people, cargo, assets, and routes. | L0-024, L0-235, L0-354–L0-358, L0-464, L0-465, L0-467; L1-026–L1-033, L1-048, L1-050, L1-058 | cargo hijacking; facility sabotage | Raises loss, delay, insurance and route avoidance; affects L2-004, L2-006, L2-008, L2-013, L2-027. |
| L2-027 | Resilience | Supply-chain resilience and continuity | Emergent ability to anticipate, absorb, adapt to, recover from, and learn from disruptions while maintaining critical outcomes. | L0-025, L0-027, L0-032, L0-043, L0-054, L0-158, L0-325, L0-359–L0-370, L0-398, L0-428, L0-444, L0-445; L1-046, L1-047, L1-050, L1-055, L1-056 | dual-site recovery; adaptive allocation | Moderates impacts of every disruptive L2 and trades off with cost, capital, complexity, and efficiency. |
| L2-028 | Innovation | Innovation ecosystem | Composite capacity of firms, suppliers, research institutions, capital, talent, standards, and policy to create and scale supply-chain improvements. | L0-059, L0-311, L0-420, L0-451, L0-472–L0-475; L1-006, L1-057–L1-059 | logistics innovation cluster; advanced-material ecosystem | Expands substitution, productivity and adaptation options; affects L2-002, L2-018, L2-021, L2-023, L2-027. |
| L2-029 | Entrepreneurship | Startup ecosystem | Composite conditions enabling new ventures to form, fund, test, partner, survive, and scale supply-chain solutions. | L0-059, L0-298, L0-311, L0-419, L0-420, L0-442, L0-451, L0-472–L0-475; L1-057–L1-059 | supply-tech accelerator; climate-tech ventures | Feeds L2-028 and L2-023; depends on capital, talent, procurement access, IP protection, and partner adoption. |
| L2-030 | Society | Demographic and consumption transition | Long-run change in demand and labor systems created by population growth, aging, urbanization, migration, participation, skills, and preferences. | L0-001–L0-005, L0-013, L0-014, L0-119, L0-447–L0-455; L1-001, L1-002, L1-014, L1-058 | urban last-mile growth; aging workforce | Reshapes product mix, facility location, workforce, channels and service; affects L2-001, L2-003, L2-021, L2-032. |
| L2-031 | Social | Human rights and social license | Composite stakeholder acceptance and rights performance arising from labor practices, safety, sourcing conduct, community effects, security, and governance. | L0-058, L0-060, L0-104, L0-112–L0-118, L0-357, L0-387–L0-400, L0-437, L0-442, L0-464–L0-466, L0-476–L0-481; L1-007, L1-015, L1-048, L1-051, L1-054, L1-057, L1-060 | forced-labor concern; community opposition | Affects permits, demand, workforce, supplier access and reputation; interacts with L2-013, L2-019, L2-021. |
| L2-032 | Network | Network structural complexity | Emergent coordination burden created by product variety, tiers, facilities, echelons, lanes, modes, jurisdictions, partners, and interdependencies. | L0-017, L0-020, L0-028, L0-055, L0-056, L0-214, L0-324, L0-325, L0-370, L0-424–L0-435, L0-443; L1-003–L1-006, L1-032, L1-055, L1-057 | multi-tier global network; omnichannel web | Can improve reach and optionality but increases latency, opacity, failure paths and governance load; affects L2-004, L2-024, L2-025, L2-027. |
| L2-033 | Ecosystem | Inter-organizational collaboration maturity | Composite ability of customers, suppliers, carriers, regulators, financiers, and service partners to share trusted data and coordinate decisions. | L0-053, L0-056, L0-335, L0-336, L0-345, L0-419, L0-440–L0-443; L1-007, L1-044–L1-047, L1-057 | CPFR network; port community system | Improves response, visibility and innovation; reduces bullwhip and friction; affects L2-001, L2-004, L2-024, L2-027–L2-029. |
| L2-034 | Resources | Environmental resource scarcity | Composite constraint created by limited water, land, energy, biomass, minerals, ecosystem services, and compliant waste capacity. | L0-030, L0-032, L0-121–L0-126, L0-377–L0-398, L0-409, L0-457, L0-458; L1-006, L1-016, L1-051–L1-053 | basin water stress; critical-mineral constraint | Raises cost, threatens continuity and forces substitution or relocation; affects L2-002, L2-008, L2-017–L2-020, L2-027. |
| L2-035 | Market access | Market-access conditions | Composite ability to lawfully and commercially serve a market given authorization, standards, trade controls, infrastructure, channels, price, and service requirements. | L0-008–L0-015, L0-035, L0-060, L0-137, L0-152, L0-260, L0-401–L0-423, L0-425; L1-002, L1-003, L1-035, L1-054, L1-055 | approved drug market; public tender entry | Governs feasible demand and network design; affected by L2-013–L2-016 and impacts L2-001, L2-008, L2-030. |

## 5. Hierarchy validation

### 5.1 Five representative L0 → L1 → L2 traces

| Trace | Atomic variable | Operational grouping | Composite force | Why the hierarchy holds |
| ----- | --------------- | -------------------- | --------------- | ----------------------- |
| 1 | **L0-047 Supplier lead-time variability** | **L1-007 Supplier qualification and performance management** and **L1-009 Inbound supply coordination** | **L2-002 Supply scarcity and concentration** | Lead-time variability is one measurable supplier property; practitioners manage it in supplier and inbound processes; combined with concentration, capacity, contracts, and material availability it contributes to systemic scarcity. |
| 2 | **L0-090 Failure frequency** | **L1-012 Equipment reliability and maintenance** | **L2-005 Operational reliability** | Failure frequency is a single observed rate; maintenance combines it with condition, spares, repair time, and labor; operational reliability emerges only when asset, worker, supplier, utility, and system reliability interact. |
| 3 | **L0-318 Sensor coverage** | **L1-046 Identification, traceability, and control-tower visibility** | **L2-024 Digital ecosystem maturity** | Sensor coverage is a measurable share; visibility combines it with identifiers, events, latency, and tier data; digital maturity also requires governance, interoperability, connectivity, security, and decision use. |
| 4 | **L0-386 Material-recovery yield** | **L1-052 Waste, reuse, recycling, and circular-flow management** | **L2-020 Circular-economy maturity** | Recovery yield is one process ratio; circular operations combine it with reverse flows, treatment, reuse, and recycling; ecosystem maturity additionally depends on design, markets, policy, partners, and economics. |
| 5 | **L0-468 Border-closure status** | **L1-058 Macroeconomic, societal, health, and geopolitical monitoring** and **L1-035 Customs and border operations** | **L2-013 Geopolitics, conflict, and sanctions** | Closure status is an observable state at a border; monitoring and border teams assess and respond to it; geopolitics emerges from interacting conflict, government, sanctions, stability, route, and payment conditions. |

### 5.2 Difficult classifications and decisions

| Concept | Final classification | Reasoning |
| ------- | -------------------- | --------- |
| Forecast error | **L0-016** | Although calculated from forecast and actual values, it is a single useful measurement at a defined grain; forecasting itself is **L1-001** and demand volatility is **L2-001**. |
| Cash-conversion duration | **L0-300** | It is treated as a directly calculated outcome measure with a defined formula; liquidity pressure is the wider interaction among cash, credit, inventory, terms, and operations at **L2-009**. |
| Port congestion versus network congestion | **L0-241** and **L2-004** | Port congestion is an observable condition for one node and scope; network congestion is an emergent multi-node and multi-process force. |
| Product carbon intensity | **L0-376** | A declared functional-unit result is usable as one variable even though an accounting method produces it; decarbonization and sustainability remain composite forces at **L2-018** and **L2-019**. |
| Supplier innovation capability | **L0-059** | It is an assessed supplier attribute; innovation ecosystem at **L2-028** requires firms, capital, research, talent, policy, and adoption to interact. |
| Network redundancy ratio | **L0-428** | It is a defined structural measurement; resilience at **L2-027** also requires visibility, buffers, alternatives, response, recovery, governance, and learning. |
| Climate exposure variables | **L0-392–L0-397** | Each records one hazard exposure for an asset or route; physical climate risk at **L2-017** combines hazard, exposure, vulnerability, consequence, and adaptation across the network. |
| Overall equipment effectiveness | **Not a canonical L0** | OEE would combine availability, performance, and quality; its components are represented by L0-073, L0-088, L0-089, L0-097, and L0-141–L0-143. |
| Perfect-order rate | **Not a canonical L0** | It combines completeness, timeliness, accuracy, condition, and documentation; those components appear separately in L0-227, L0-238, L0-265, L0-272, and L0-279 and roll into **L2-006**. |
| Social license | **L2-031** | It is not one measurable operating property; it emerges from labor, safety, community, environmental, security, sourcing, and governance behavior. |

### 5.3 Major L2 overlaps and feedback loops

| Feedback loop | Mechanism |
| ------------- | --------- |
| L2-001 Demand volatility ↔ L2-003 Capacity pressure | Demand spikes consume buffers and capacity; shortages, delays, and substitutions then distort ordering and amplify apparent demand. |
| L2-002 Supply scarcity ↔ L2-008 Cost pressure | Scarcity raises price and expedite cost; reduced affordability or investment can constrain capacity and qualified supply further. |
| L2-004 Congestion ↔ L2-009 Working-capital pressure | Congestion increases pipeline inventory and cash-conversion time; liquidity constraints can reduce capacity bookings and prolong congestion. |
| L2-013 Geopolitics ↔ L2-014 Trade complexity | Political conflict creates controls and tariffs; economic restrictions alter alliances, routing, and retaliatory policy. |
| L2-017 Physical climate risk ↔ L2-018 Energy transition | Climate damage accelerates transition pressure; transition choices alter emissions trajectories, asset exposure, and near-term resource demand. |
| L2-020 Circularity ↔ L2-032 Network complexity | Circular flows reduce virgin-material dependence but add returns, sorting, ownership, quality, and recovery nodes that increase coordination complexity. |
| L2-021 Workforce transformation ↔ L2-023 Technology disruption | Technology changes tasks and skills; labor availability, trust, safety, and learning rates determine adoption speed and realized value. |
| L2-024 Digital maturity ↔ L2-025 Cyber risk | More connectivity improves visibility and coordination but expands attack paths; security controls can either enable trusted sharing or create friction. |
| L2-027 Resilience ↔ L2-008 Cost pressure | Buffers, redundancy, and alternatives require capital and operating cost; disruption avoidance and faster recovery protect margin and liquidity. |
| L2-028 Innovation ↔ L2-029 Startup ecosystem | Research and industrial partners create venture opportunities; startups accelerate experimentation, competitive pressure, and technology diffusion. |
| L2-030 Demographic transition ↔ L2-016 Infrastructure maturity | Population and urbanization reshape infrastructure demand; infrastructure access in turn shapes migration, labor catchments, and market formation. |
| L2-031 Social license ↔ L2-035 Market access | Rights and community performance affect permits and customer acceptance; entry conditions and buyer requirements change operating and sourcing behavior. |

### 5.4 Coverage-gap assessment

| Required coverage area | Primary L0 span or IDs | Primary L1 | Gap assessment |
| ---------------------- | ---------------------- | ---------- | -------------- |
| Demand, consumption, customers, markets | L0-001–L0-016, L0-265–L0-279 | L1-001, L1-002, L1-036–L1-038 | Covered across volume, behavior, price, channels, promises, orders, and service. |
| Products, materials, raw sourcing, packaging | L0-017–L0-060 | L1-003–L1-007 | Covered across lifecycle, specifications, BOM, hazards, origin, packaging, source capacity, tiers, and substitution. |
| Procurement, contracting, suppliers | L0-043–L0-070 | L1-006–L1-009 | Covered across qualification, allocation, price, competition, terms, flexibility, approval, and PO quality. |
| Manufacturing, machinery, automation, maintenance | L0-071–L0-100, L0-337–L0-340 | L1-010–L1-013 | Covered for transformation and service operations; sector-specific process parameters remain extensions. |
| Labor, skills, health, safety | L0-101–L0-120, L0-447–L0-466 | L1-014, L1-015, L1-058 | Covered across staffing, capability, cost, relations, demographics, mobility, exposure, and public health. |
| Energy, water, utilities | L0-121–L0-134, L0-375, L0-377–L0-379 | L1-016, L1-051 | Covered across capacity, price, quality, outage, backup, cooling, metering, and resource intensity. |
| Quality, product safety, compliance | L0-135–L0-154, L0-399–L0-423 | L1-017, L1-018, L1-054 | Covered across inspection, process control, release, complaint, recall, certification, authorization, and records. |
| Inventory | L0-155–L0-174 | L1-019, L1-020 | Covered across physical, promise, allocation, buffers, replenishment, ageing, accuracy, cost, and ownership. |
| Warehousing, handling, internal movement | L0-175–L0-201 | L1-021–L1-025 | Covered across storage classes, labor, queues, receiving, put-away, picking, packing, internal routes, yard, and conditions. |
| Road, rail, air, sea, multimodal, cargo | L0-202–L0-240 | L1-026–L1-032 | Covered across assets, people, capacity, rates, routes, schedules, delays, damage, theft, temperature, tracking, and emissions. |
| Ports, terminals, airports, borders, infrastructure | L0-241–L0-264 | L1-033–L1-035 | Covered across shared-node capacity, slots, dwell, physical network constraints, border queues, inspections, and connectivity. |
| Distribution, last mile, returns, reverse logistics | L0-265–L0-286 | L1-036–L1-040 | Covered across order orchestration, fulfilment, allocation, last mile, returns, repair, refurbishment, and value recovery. |
| Cost, price, cash, credit, insurance | L0-287–L0-312 | L1-041–L1-043 | Covered across operating and landed cost, working capital, rates, currency, defaults, policy structure, claims, and margin. |
| Data, software, visibility, communication, decisions | L0-313–L0-346 | L1-044–L1-047 | Covered across governance, systems, interfaces, sensing, events, latency, models, scenarios, automation, and communication. |
| Security, cyber, risk, continuity | L0-347–L0-370, L0-428, L0-444, L0-445 | L1-048–L1-050 | Covered across prevention, detection, physical controls, alternatives, objectives, actual recovery, plans, tests, and dependency maps. |
| Waste, circularity, environment, climate | L0-371–L0-398 | L1-051–L1-053 | Covered across emissions, resources, pollution, waste, recovery, permits, physical hazards, and adaptation. |
| Law, regulation, taxes, trade policy | L0-399–L0-423 | L1-035, L1-054 | Covered across labor, environment, licenses, sanctions, customs, origin, quota, duty, tax, privacy, IP, and public procurement. |
| Network design, governance, collaboration | L0-424–L0-446 | L1-055–L1-057 | Covered across footprint, roles, capacity, lanes, allocations, echelons, redundancy, decisions, policy, partners, and outsourcing. |
| Technology, research, innovation, startups | L0-059, L0-311, L0-337–L0-340, L0-420, L0-472–L0-475 | L1-013, L1-045, L1-059 | Covered as atomic capabilities and ecosystem forces; specific technologies are instantiated as extensions. |
| Geopolitics, macroeconomics, society, public health | L0-447–L0-471 | L1-058 | Covered across population, labor, confidence, growth, prices, health, unrest, crime, conflict, borders, sanctions, stability, and corruption. |
| Human rights and community relations | L0-476–L0-481 | L1-060 | Covered across due diligence, forced and child labor, living wage, community grievances, consultation, and social-license drivers. |

No required domain is absent. The principal intentional gaps are industry-specific measurement extensions—not missing supply-chain domains—for example mine ore grade, hospital bed acuity, semiconductor wafer yield stage, aircraft part life limit, crop soil moisture, software-service request latency, or construction crew productivity by trade. These can be added beneath the relevant canonical variable without changing the hierarchy.

### 5.5 Assumptions and limitations

1. **Defined grain is mandatory.** Every L0 value must be bound to an item or service, location or lane, party or asset, time period, scenario, unit, and—where relevant—jurisdiction.
2. **Atomic is model-relative.** A metric may be derived mathematically yet remain L0 when it is the smallest decision-useful variable in this taxonomy; composite management indices such as OEE, perfect order, ESG, and resilience are not L0.
3. **Principal dependencies are not a causal proof.** The references identify strong operational links; direction, lag, nonlinearity, and causal strength must be estimated for a specific network.
4. **The same L0 may support multiple L1s.** Shared variables do not violate the one-home-category rule because L1s are operating views, not mutually exclusive data ownership domains.
5. **Ranges are inclusive.** `L0-001–L0-004` denotes all four variables and is used only to keep the catalogue readable.
6. **Statuses and scores require governed scales.** Variables such as product criticality, supplier financial health, equipment condition, and exposure ratings need documented rubrics, evidence dates, and owners.
7. **Industry neutrality limits parameter detail.** Regulated-sector, commodity, clinical, agricultural, project, and digital-service extensions should specialize—not duplicate—the canonical variables.
8. **Legal and policy values are time-sensitive.** Tariffs, licenses, sanctions, taxes, and market authorizations must be resolved by product, party, origin, destination, and effective date.
9. **Financial values require basis and currency.** Cost, price, value, margin, and insurance data must state currency, accounting basis, tax treatment, and exchange-rate date.
10. **Environmental values require boundaries.** Emissions, water, waste, land, biodiversity, and circularity measures must state organizational, lifecycle, allocation, geography, and methodology boundaries.
11. **Human and ethical variables are not reducible to efficiency.** Safety, rights, health, mobility, and social-license decisions require normative thresholds in addition to performance measurements.
12. **The catalogue is extensible.** Local variables should inherit a canonical L0 parent, add the required grain and unit, and avoid creating a new L1 or L2 unless the operating purpose or emergent force is genuinely distinct.
