if (window.location.href.includes('sakura.fm')) {
    const fontAwesomeCDN = document.createElement('link');
    fontAwesomeCDN.rel = 'stylesheet';
    fontAwesomeCDN.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(fontAwesomeCDN);

    const checkCharacterDiv = () => {
        const mainDiv = document.querySelector('div.flex.flex-col.space-y-6.pt-6');
        
        if (mainDiv && mainDiv.querySelector('div:first-child div.font-bold') && mainDiv.querySelector('div.flex.flex-row.items-center.gap-2')) {
            const nameContainer = mainDiv.querySelector('div:first-child');
            const nameDiv = nameContainer.querySelector('div.font-bold');
            const characterName = nameDiv.textContent.trim();

            if (characterName) {
                const statsDiv = nameContainer.querySelector('div.flex.flex-row.items-center.gap-2');

                if (statsDiv && !statsDiv.querySelector('.character-day-counter')) {
                    const daySpan = document.createElement('span');
                    daySpan.className = 'text-muted-foreground line-clamp-2 character-day-counter';
                    daySpan.style.marginLeft = '10px';
                    daySpan.style.color = '#666';
                    daySpan.style.transition = 'all 0.3s ease';
                    daySpan.style.cursor = 'pointer';
                    daySpan.style.padding = '4px 8px';
                    daySpan.style.borderRadius = '4px';
                    daySpan.style.position = 'relative';
                    daySpan.style.backgroundColor = 'rgba(44, 62, 80, 0.9)';
                    daySpan.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                    
                    const overlay = document.createElement('div');
                    overlay.style.position = 'fixed';
                    overlay.style.top = '0';
                    overlay.style.left = '0';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    overlay.style.display = 'none';
                    overlay.style.justifyContent = 'center';
                    overlay.style.alignItems = 'center';
                    overlay.style.zIndex = '10000';
                    
                    const badgeContainer = document.createElement('div');
                    badgeContainer.style.backgroundColor = '#2c3e50';
                    badgeContainer.style.padding = '30px';
                    badgeContainer.style.borderRadius = '15px';
                    badgeContainer.style.minWidth = '400px';
                    badgeContainer.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                    badgeContainer.style.position = 'relative';
                    badgeContainer.className = 'animate__animated animate__fadeInDown';
                    
                    const characterKey = `character_${characterName}`;
                    const savedData = localStorage.getItem(characterKey);
                    let currentDay;
                    
                    if (!savedData) {
                        const data = {
                            startDate: new Date().toISOString(),
                            day: 1,
                            rewards: []
                        };
                        localStorage.setItem(characterKey, JSON.stringify(data));
                        currentDay = 1;
                    } else {
                        const data = JSON.parse(savedData);
                        const start = new Date(data.startDate);
                        const now = new Date();
                        const diffTime = Math.abs(now - start);
                        currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        data.day = currentDay;
                        if (!data.rewards) data.rewards = [];
                        localStorage.setItem(characterKey, JSON.stringify(data));

                        const checkAndAddReward = (day, rewardText, rewardIcon) => {
                            if (currentDay >= day && !data.rewards.includes(rewardText)) {
                                data.rewards.push(rewardText);
                                localStorage.setItem(characterKey, JSON.stringify(data));
                                
                                const rewardBadge = document.createElement('span');
                                rewardBadge.className = 'reward-badge';
                                rewardBadge.style.marginLeft = '8px';
                                rewardBadge.style.padding = '4px 8px';
                                rewardBadge.style.backgroundColor = '#ffd700';
                                rewardBadge.style.borderRadius = '12px';
                                rewardBadge.style.fontSize = '12px';
                                rewardBadge.style.color = '#000';
                                rewardBadge.style.display = 'inline-flex';
                                rewardBadge.style.alignItems = 'center';
                                rewardBadge.style.animation = 'fadeIn 0.5s ease-in';
                                rewardBadge.innerHTML = `<i class="fas ${rewardIcon}"></i> ${rewardText}`;
                                badgeContainer.appendChild(rewardBadge);
                            }
                        };

                        checkAndAddReward(5, 'Novice Friend', 'fa-star');
                        checkAndAddReward(10, 'Loyal Companion', 'fa-medal');
                        checkAndAddReward(30, 'Dedicated Partner', 'fa-crown');
                        checkAndAddReward(50, 'Soulmate', 'fa-heart');
                        checkAndAddReward(100, 'Eternal Bond', 'fa-infinity');
                    }
                    
                    daySpan.innerHTML = `<i class="fas fa-calendar-alt"></i> Day ${currentDay}`;
                    statsDiv.appendChild(daySpan);
                    document.body.appendChild(overlay);
                    
                    daySpan.onclick = () => {
                        overlay.style.display = 'flex';
                        badgeContainer.className = 'animate__animated animate__fadeInDown';
                    };

                    const closeButton = document.createElement('button');
                    closeButton.innerHTML = '<i class="fas fa-times"></i>';
                    closeButton.style.position = 'absolute';
                    closeButton.style.top = '15px';
                    closeButton.style.right = '15px';
                    closeButton.style.backgroundColor = 'transparent';
                    closeButton.style.border = 'none';
                    closeButton.style.color = 'white';
                    closeButton.style.fontSize = '24px';
                    closeButton.style.cursor = 'pointer';
                    closeButton.onclick = () => {
                        badgeContainer.className = 'animate__animated animate__fadeOutUp';
                        setTimeout(() => {
                            overlay.style.display = 'none';
                        }, 500);
                    };

                    const data = JSON.parse(localStorage.getItem(characterKey));
                    if (data.rewards) {
                        const badgeTitle = document.createElement('div');
                        badgeTitle.innerHTML = '<i class="fas fa-trophy"></i> Your Achievements';
                        badgeTitle.style.fontSize = '24px';
                        badgeTitle.style.fontWeight = 'bold';
                        badgeTitle.style.marginBottom = '20px';
                        badgeTitle.style.color = '#fff';
                        badgeTitle.style.textAlign = 'center';
                        badgeContainer.appendChild(badgeTitle);
                        badgeContainer.appendChild(closeButton);

                        data.rewards.forEach(reward => {
                            const icon = {
                                'Novice Friend': 'fa-star',
                                'Loyal Companion': 'fa-medal',
                                'Dedicated Partner': 'fa-crown',
                                'Soulmate': 'fa-heart',
                                'Eternal Bond': 'fa-infinity'
                            }[reward];
                            
                            const badgeItem = document.createElement('div');
                            badgeItem.style.display = 'flex';
                            badgeItem.style.alignItems = 'center';
                            badgeItem.style.padding = '15px';
                            badgeItem.style.color = '#fff';
                            badgeItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            badgeItem.style.margin = '10px 0';
                            badgeItem.style.borderRadius = '10px';
                            badgeItem.style.transition = 'all 0.3s ease';
                            badgeItem.innerHTML = `<i class="fas ${icon}" style="margin-right: 10px; font-size: 20px;"></i> ${reward}`;
                            
                            badgeItem.onmouseenter = () => {
                                badgeItem.style.transform = 'translateX(10px)';
                                badgeItem.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            };
                            
                            badgeItem.onmouseleave = () => {
                                badgeItem.style.transform = 'translateX(0)';
                                badgeItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            };
                            
                            badgeContainer.appendChild(badgeItem);
                        });
                    }

                    overlay.appendChild(badgeContainer);
                    overlay.onclick = (e) => {
                        if (e.target === overlay) {
                            badgeContainer.className = 'animate__animated animate__fadeOutUp';
                            setTimeout(() => {
                                overlay.style.display = 'none';
                            }, 500);
                        }
                    };
                }
            }
        }
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                checkCharacterDiv();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    checkCharacterDiv();
}