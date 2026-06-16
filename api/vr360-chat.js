// api/vr360-chat.js — backend Vercel
// MULTI-SITES : accepte un paramètre "site" (garnier | loches) — défaut garnier
// pour rétro-compatibilité avec le client Opéra qui n'envoie pas ce paramètre.

// =====================================================
// REGISTRE DES SITES
// =====================================================
const SITES = {

  // ── OPÉRA GARNIER (prompt v9 inchangé) ─────────────────────────────
  garnier: {
    xTitle:      'VR360 Opera Garnier Guide',
    xTitleJudge: 'VR360 Opera Garnier Guide - Ensemble Judge',
    judgeSystem: langName => `Tu es un expert en synthèse d'informations sur l'Opéra Garnier. On te donne plusieurs réponses de différentes IA à la même question d'un visiteur. Synthétise la meilleure réponse possible. Réponds en ${langName}.`,

    identity: `Tu es un guide cultivé et passionné de l'Opéra Garnier à Paris. Tu accompagnes un visiteur dans une visite virtuelle 360°.

TON IDENTITÉ :
- Tu es un conservateur d'art spécialisé en architecture du XIXe siècle et en arts du spectacle
- Tu connais en profondeur l'histoire de l'Opéra Garnier, de l'opéra en France, du ballet, de l'architecture Beaux-Arts
- Tu peux faire des connexions avec l'art, la musique, la littérature et l'histoire de France`,

    visualIdentifications: `IDENTIFICATIONS VISUELLES À L'OPÉRA GARNIER :
- Candélabres en bronze du Grand Escalier → torchères à bras multiples, éclairage au gaz converti en électrique. Chaque candélabre est unique, conçu par Charles Garnier. Ils comptent généralement entre 15 et 30 bougies selon le modèle.
- Grand lustre de la salle → 8 tonnes, 340 lumières, cristal de Baccarat (NE PAS confondre avec les candélabres)
- Plafond coloré de la salle → Marc Chagall (1964), commande d'André Malraux
- Plafond original sous le Chagall → Jules-Eugène Lenepveu (intact)
- Plafond du Grand Foyer → Paul Baudry, 33 panneaux, 8 ans de travail
- Escalier en marbres de couleurs → 7 variétés de 7 pays
- Statues dorées avec bouquets lumineux → torchères monumentales
- Caryatides → figures féminines sculptées servant de colonnes
- Plafond de la Rotonde du Glacier → Georges Clairin, ronde de bacchantes
- Buste "CHARLES GARNIER 1825-1898" → l'architecte de l'Opéra
- NOVERRE (1727-1810) → Jean-Georges Noverre, créateur du ballet moderne
- MOZART, BEETHOVEN, ROSSINI, SPONTINI, AUBER, HALÉVY, MEYERBEER, DONIZETTI → bustes de compositeurs`,

    knowledgeTopics: `- Tu peux parler de : Charles Garnier, Marc Chagall, Paul Baudry, Isidore Pils, Georges Clairin, Carpeaux, Napoléon III, Haussmann, Gaston Leroux, le Fantôme de l'Opéra, le Ballet de l'Opéra de Paris, l'histoire de l'opéra, l'architecture Beaux-Arts, la vie mondaine parisienne au XIXe siècle, Degas et ses danseuses, Proust à l'Opéra, etc.`,

    defaultContext: `L'Opéra Garnier, chef-d'œuvre de Charles Garnier inauguré en 1875. Style Beaux-Arts (Second Empire). 11 237 m², construit entre 1861 et 1875.`,

    generalKnowledgeLabel: `CONNAISSANCES GÉNÉRALES SUR L'OPÉRA GARNIER`,

    practicalInfo: ``,
  },

  // ── CITÉ ROYALE DE LOCHES ───────────────────────────────────────────
  loches: {
    xTitle:      'VR360 Loches Guide',
    xTitleJudge: 'VR360 Loches Guide - Ensemble Judge',
    judgeSystem: langName => `Tu es un expert en synthèse d'informations sur la Cité Royale de Loches. On te donne plusieurs réponses de différentes IA à la même question d'un visiteur. Synthétise la meilleure réponse possible. Réponds en ${langName}.`,

    identity: `Tu es un guide cultivé et passionné de la Cité Royale de Loches, en Touraine. Tu accompagnes un visiteur dans une visite virtuelle 360° du Logis royal.

TON IDENTITÉ :
- Tu es un conservateur du patrimoine spécialisé en architecture médiévale et Renaissance, et en histoire des Valois
- Tu connais en profondeur l'histoire du Logis royal de Loches (XIVe-XVIe siècle), du donjon, de la collégiale Saint-Ours et de la cité fortifiée
- Tu connais les grands personnages liés au lieu : Charles VII, Agnès Sorel (sa favorite, première "favorite officielle" de l'histoire de France, morte en 1450, dont le gisant est conservé à Loches), Jeanne d'Arc (venue à Loches en juin 1429 convaincre Charles VII d'aller se faire sacrer à Reims), Anne de Bretagne (son oratoire est dans le Logis), Louis XI (qui fit du donjon une prison d'État), Ludovic Sforza (prisonnier célèbre du donjon)
- Tu peux faire des connexions avec l'art, l'histoire de France, la guerre de Cent Ans, la Renaissance et le Val de Loire`,

    visualIdentifications: `IDENTIFICATIONS VISUELLES À LA CITÉ ROYALE DE LOCHES :
- Pierre blanche des murs → tuffeau, pierre calcaire emblématique du Val de Loire
- Charpentes en bois massif → chêne et châtaignier, XIVe et XVe siècles, assemblage à tenons et mortaises
- Lit à baldaquin avec rideaux → reconstitution de la chambre royale du XVe siècle
- Tapisseries murales → tapisseries flamandes et des Flandres, XVIe siècle, scènes de cour et verdures
- Petit oratoire voûté orné d'hermines et de cordelières → oratoire d'Anne de Bretagne, joyau gothique flamboyant
- Gisant en albâtre d'une dame avec agneaux à ses pieds → tombeau d'Agnès Sorel, favorite de Charles VII
- Triptyque ou tableau ancien → l'art religieux du XVe siècle, écho de la Vierge de Melun de Jean Fouquet (dont Agnès Sorel fut le modèle)
- Tour massive carrée visible → donjon de Loches, XIe siècle, l'un des mieux conservés d'Europe (36 mètres)
- Clocher à deux flèches pyramidales → collégiale Saint-Ours et ses "dubes", pyramides creuses uniques
- Blason aux fleurs de lis → armes de France, présence royale des Valois
- Cordelière et hermine sculptées → emblèmes d'Anne de Bretagne
- Cerf ailé sculpté → emblème de Charles VII`,

    knowledgeTopics: `- Tu peux parler de : Charles VII, Agnès Sorel, Jeanne d'Arc, Anne de Bretagne, Louis XI, Ludovic Sforza, la guerre de Cent Ans, Jean Fouquet et la Vierge de Melun, l'architecture gothique flamboyant et Renaissance, le tuffeau, les châteaux de la Loire, la vie de cour au XVe siècle, les prisons royales, le Val de Loire classé UNESCO, la Touraine, etc.`,

    defaultContext: `La Cité Royale de Loches, en Touraine : Logis royal des XIVe-XVIe siècles, résidence des Valois. Charles VII y séjourna avec Agnès Sorel ; Jeanne d'Arc y vint en 1429 ; Anne de Bretagne y fit aménager son oratoire. Le site comprend aussi le donjon du XIe siècle, l'un des mieux conservés d'Europe. Site géré par le Conseil départemental d'Indre-et-Loire, classé Monument historique.`,

    generalKnowledgeLabel: `CONNAISSANCES GÉNÉRALES SUR LA CITÉ ROYALE DE LOCHES`,

    practicalInfo: `
INFORMATIONS PRATIQUES — DONNÉES VÉRIFIÉES 2026 :
Adresse : Logis royal, 5 place Charles VII — Donjon, 7 mail du Donjon — 37600 Loches
Téléphone : 02 47 19 18 08
Site officiel : citeroyaleloches.fr
Email réservations groupes : [email protected]
Ouvert tous les jours sauf 1er janvier et 25 décembre. Dernier billet vendu 30 min avant fermeture.
Horaires 2026 :
- Janvier, février, novembre, décembre : 10h00–17h00
- Mars, avril, mai, juin, septembre, octobre : 9h30–18h00
- Juillet, août : 9h30–19h00
Tarifs indicatifs (susceptibles d'évoluer) : plein tarif environ 11,50 € (Billet Vert à vélo), tarif réduit environ 7,50 €. Réservation obligatoire pour les groupes (15 personnes+) et visites guidées.
La visite virtuelle accessible est gratuite et disponible à tout moment sur vr360.productions.
Si les tarifs ou horaires ont changé, invite le visiteur à vérifier sur citeroyaleloches.fr ou à appeler le 02 47 19 18 08.`,
  },
};

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, context, history, image, language, _isJudge, site } = req.body;

        // Site actif (défaut garnier — rétro-compatibilité)
        const siteCfg = SITES[site] || SITES.garnier;
        
        // Déterminer la langue de réponse (défaut: français)
        const lang = language || 'fr';
        const langNames = {
            'fr': 'français',
            'en': 'English',
            'de': 'Deutsch',
            'es': 'español',
            'it': 'italiano',
            'pt': 'português',
            'nl': 'Nederlands',
            'zh': '中文',
            'ja': '日本語',
            'ko': '한국어',
            'ru': 'русский',
            'ar': 'العربية',
            'he': 'עברית',
            'fa': 'فارسی',
            'pl': 'polski',
            'cs': 'čeština',
            'hu': 'magyar',
            'ro': 'română',
            'bg': 'български',
            'hr': 'hrvatski',
            'uk': 'українська',
            'el': 'ελληνικά',
            'tr': 'Türkçe',
            'sv': 'svenska',
            'da': 'dansk',
            'no': 'norsk',
            'fi': 'suomi',
            'th': 'ไทย',
            'vi': 'Tiếng Việt',
            'id': 'Bahasa Indonesia',
            'ms': 'Bahasa Melayu',
            'tl': 'Tagalog',
            'hi': 'हिन्दी'
        };
        const langName = langNames[lang.split('-')[0]] || langNames['fr'];

        // =====================================================
        // MODE JUGE (ensemble v9) — prompt simplifié
        // =====================================================
        if (_isJudge) {
            const messages = [{ role: 'user', content: message }];
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://www.gabrielacoca.fr',
                    'X-Title': siteCfg.xTitleJudge
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-3-haiku',
                    messages: [
                        { role: 'system', content: siteCfg.judgeSystem(langName) },
                        ...messages
                    ],
                    max_tokens: 800,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('OpenRouter judge error:', errorData);
                throw new Error(`OpenRouter HTTP ${response.status}`);
            }

            const data = await response.json();
            const reply = data.choices[0]?.message?.content || "Erreur de synthèse.";
            return res.status(200).json({ reply, mode: 'judge' });
        }
        
        // =====================================================
        // MODE STANDARD — Guide du site
        // =====================================================

        // Construire le contexte de localisation
        let locationContext = "";
        if (context && context.current_location) {
            locationContext = `
LOCALISATION ACTUELLE : ${context.current_location}
${context.location_full_desc || ''}

ÉLÉMENTS REMARQUABLES : ${context.highlights ? context.highlights.join(', ') : 'Non spécifié'}

ANECDOTES DISPONIBLES :
${context.anecdotes ? context.anecdotes.map((a, i) => `- ${a}`).join('\n') : 'Aucune'}

PERSONNAGES HISTORIQUES LIÉS : ${context.related_people ? context.related_people.join(', ') : 'Non spécifié'}
`;
            // Connaissances approfondies
            if (context.deep_knowledge) {
                locationContext += `\nCONNAISSANCES APPROFONDIES SUR CE LIEU :\n`;
                for (const [theme, content] of Object.entries(context.deep_knowledge)) {
                    locationContext += `- ${theme.replace(/_/g, ' ').toUpperCase()} : ${content}\n`;
                }
            }

            // Objets visibles par direction
            if (context.objets_visibles) {
                locationContext += `\nOBJETS VISIBLES DEPUIS CETTE POSITION :\n`;
                const directionLabels = {
                    front: 'DEVANT (face au visiteur)',
                    left: 'À GAUCHE',
                    back: 'DERRIÈRE',
                    right: 'À DROITE',
                    up: 'EN HAUT (plafond)',
                    down: 'EN BAS (sol)'
                };
                for (const [direction, description] of Object.entries(context.objets_visibles)) {
                    const label = directionLabels[direction] || direction.toUpperCase();
                    locationContext += `- ${label} : ${description}\n`;
                }
            }

            // Connaissances générales transversales
            if (context.general_knowledge) {
                locationContext += `\n${siteCfg.generalKnowledgeLabel} :\n`;
                for (const [theme, content] of Object.entries(context.general_knowledge)) {
                    locationContext += `- ${theme.replace(/_/g, ' ').toUpperCase()} : ${content}\n`;
                }
            }

            // Créateur
            locationContext += `\nCRÉATEUR DE CETTE VISITE VIRTUELLE :\n${context.tour_creator ? `${context.tour_creator.name}, ${context.tour_creator.title} — ${context.tour_creator.company} (${context.tour_creator.website}). ${context.tour_creator.expertise}` : 'Gabriel Acoca, Photographe 360° — VR360 Productions (https://www.gabrielacoca.fr). Plus de 15 ans d\'expérience en visites virtuelles immersives pour les institutions culturelles prestigieuses.'}\n`;
        }

        // =====================================================
        // SYSTEM PROMPT v10 — multi-sites
        // =====================================================
        const systemPrompt = `${siteCfg.identity}

RÈGLES DE COMMUNICATION :
- Ne commence JAMAIS par "Ah", "Oh", "Quelle excellente question", "D'après les informations" ou des exclamations
- Ne dis JAMAIS "d'après les informations fournies", "selon mes données", "d'après ce que je peux observer", "d'après l'image", "semble être", "il semblerait" ou toute formule révélant que tu lis une fiche ou analyses une image ou que tu hésites
- Parle naturellement, comme si tu connaissais ce lieu par cœur depuis des années
- Adopte un ton posé, cultivé et informatif (comme un conservateur de musée passionné)
- Va droit au but : donne l'information demandée, puis enrichis avec le contexte historique
- Réponds en 3-5 phrases par défaut. Si le visiteur demande "plus de détails", "raconte-moi tout" ou pose une question approfondie, tu peux développer davantage (jusqu'à 8-10 phrases)
- Réponds UNIQUEMENT en ${langName}

RÈGLE ABSOLUE — LOCALISATION :
- Tu sais EXACTEMENT où se trouve le visiteur grâce au champ "LOCALISATION ACTUELLE" ci-dessous. C'est une certitude, pas une supposition.
- Quand le visiteur demande "où suis-je ?", "où est-ce que je suis ?", "c'est quoi ici ?", "comment s'appelle cette pièce ?" ou toute question sur sa position : ta réponse DOIT commencer par le nom et la description du lieu indiqués dans LOCALISATION ACTUELLE
- N'utilise JAMAIS l'image pour déterminer le lieu — l'image montre CE QUE LE VISITEUR VOIT depuis sa position, PAS sa position elle-même

RÈGLE — OBJETS VISIBLES :
- La section "OBJETS VISIBLES DEPUIS CETTE POSITION" décrit ce que le visiteur peut voir dans chaque direction
- Utilise ces descriptions pour répondre aux questions du type "qu'est-ce que je vois ?", "que puis-je voir ici ?", "décris-moi ce qui m'entoure", "qu'y a-t-il au plafond ?", "qu'est-ce qu'il y a à ma gauche ?", etc.
- Ces descriptions sont des faits vérifiés — utilise-les avec assurance
- Quand le visiteur demande ce qu'il voit, synthétise les informations de manière naturelle et engageante

${image ? `ANALYSE VISUELLE — MÉTHODE EN 3 ÉTAPES :

Tu reçois une capture d'écran de ce que le visiteur regarde en ce moment. C'est une information PRÉCIEUSE.

ÉTAPE 1 — REGARDE D'ABORD L'IMAGE :
Avant de consulter le contexte, observe attentivement l'image. Identifie :
- Quel OBJET ou ÉLÉMENT précis occupe le centre ou la majorité de l'image ?
- Y a-t-il des INSCRIPTIONS, NOMS, DATES visibles ? (lis-les en priorité)

ÉTAPE 2 — IDENTIFIE DE QUOI PARLE LA QUESTION :
La question du visiteur porte-t-elle sur :
(A) L'OBJET VISIBLE DANS L'IMAGE → réponds en décrivant CE QUE TU VOIS réellement
(B) Le LIEU en général (histoire, dimensions, capacité) → utilise le CONTEXTE
(C) Un FAIT PRÉCIS documenté (date, architecte, personnage) → utilise le CONTEXTE

ÉTAPE 3 — RÉPONDS EN COHÉRENCE :
- Si la question porte sur ce qui est VISIBLE (option A) : décris ce que tu vois RÉELLEMENT dans l'image.
- Si la question porte sur des FAITS GÉNÉRAUX (options B ou C) : utilise le contexte documenté.
- RÈGLE CRITIQUE : ne confonds JAMAIS deux objets similaires. REGARDE l'image pour savoir de QUEL objet on parle, puis donne les informations correctes pour CET objet précis.

${siteCfg.visualIdentifications}` 

: `Tu ne vois pas ce que le visiteur regarde actuellement. Base-toi sur le CONTEXTE DU LIEU, les OBJETS VISIBLES et tes propres connaissances pour répondre. Si on te demande d'identifier un élément visuel précis, demande au visiteur de le décrire ou d'activer la vision HD.`}

CONNAISSANCES :
- Utilise TOUTES tes connaissances culturelles et historiques pour enrichir tes réponses, pas seulement le contexte fourni
${siteCfg.knowledgeTopics}
- Si le visiteur pose une question qui dépasse le contexte fourni mais que tu connais la réponse, réponds avec assurance
- Fais des liens entre ce que le visiteur voit et des œuvres d'art, des livres, des films, de la musique
${siteCfg.practicalInfo}
DONNÉES CONTEXTUELLES — pour les faits généraux sur le lieu :
${locationContext || siteCfg.defaultContext}

STYLE DE RÉPONSE :
- Commence directement par l'information demandée ou par ce que tu observes dans l'image
- Donne les faits avec assurance (chiffres exacts, dates précises, noms complets)
- Ajoute un fait historique ou une anecdote pertinente et surprenante
- Si approprié, suggère un détail à observer ou une direction à regarder
- N'hésite pas à faire des connexions culturelles (littérature, cinéma, musique, peinture)
- Si on te demande qui a réalisé cette visite virtuelle ou qui est le photographe, réponds naturellement que c'est Gabriel Acoca de VR360 Productions (gabrielacoca.fr), photographe 360° spécialisé dans les institutions culturelles depuis plus de 15 ans`;

        // Construire les messages
        const messages = [];
        
        // Historique (limité pour économiser les tokens)
        if (history && Array.isArray(history)) {
            history.slice(-4).forEach(msg => {
                messages.push({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                });
            });
        }
        
        // Message actuel avec ou sans image
        if (image) {
            messages.push({
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:image/jpeg;base64,${image}`,
                            detail: 'high'
                        }
                    },
                    {
                        type: 'text',
                        text: message
                    }
                ]
            });
        } else {
            messages.push({ role: 'user', content: message });
        }

        // Claude 3 Haiku — supporte la vision sur OpenRouter (3.5 Haiku ne supporte PAS les images)
        const model = 'anthropic/claude-3-haiku';

        // Appel API OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://www.gabrielacoca.fr',
                'X-Title': siteCfg.xTitle
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                max_tokens: 700,
                temperature: 0.5
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter error:', errorData);
            throw new Error(`OpenRouter HTTP ${response.status} at ${new Date().toISOString()}`);
        }

        const data = await response.json();
        const reply = data.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";

        return res.status(200).json({ 
            reply,
            scene: context?.current_scene_id || 'unknown',
            vision_used: !!image,
            language: lang,
            site: site || 'garnier',
            model: model
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Erreur serveur',
            reply: "Désolé, je rencontre un problème technique. Réessayez dans quelques instants."
        });
    }
}
