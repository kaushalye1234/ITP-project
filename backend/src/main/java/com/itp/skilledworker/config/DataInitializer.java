package com.itp.skilledworker.config;

import com.itp.skilledworker.entity.EquipmentCategory;
import com.itp.skilledworker.entity.JobCategory;
import com.itp.skilledworker.entity.User;
import com.itp.skilledworker.repository.EquipmentCategoryRepository;
import com.itp.skilledworker.repository.JobCategoryRepository;
import com.itp.skilledworker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final JobCategoryRepository jobCategoryRepository;
    private final EquipmentCategoryRepository equipmentCategoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedJobCategories();
        seedEquipmentCategories();
    }

    private void seedAdmin() {
        String adminEmail = "admin@skillconnect.com";
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }
        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
        admin.setRole(User.Role.admin);
        admin.setIsVerified(true);
        admin.setIsActive(true);
        userRepository.save(admin);
        log.info("✅ Default admin created: {} / Admin@123", adminEmail);
    }

    private void seedJobCategories() {
        if (jobCategoryRepository.count() > 0)
            return;

        String[][] cats = {
                { "Plumbing", "🔧", "Pipe repairs, installations, and maintenance" },
                { "Electrical", "⚡", "Wiring, panel work, lighting installations" },
                { "Painting", "🎨", "Interior and exterior painting services" },
                { "Carpentry", "🪚", "Furniture, doors, cabinets, woodwork" },
                { "Masonry", "🧱", "Brickwork, tiling, plastering" },
                { "Cleaning", "🧹", "Deep cleaning, regular maintenance" },
                { "Landscaping", "🌿", "Garden design, lawn care, tree trimming" },
                { "Roofing", "🏠", "Roof repairs, installations, waterproofing" },
                { "HVAC", "❄️", "Air conditioning, ventilation, heating" },
                { "Welding", "🔩", "Metal fabrication, gate work, welding repairs" },
                { "Appliance Repair", "🔌", "Washing machine, fridge, TV repairs" },
                { "Moving & Transport", "🚛", "House moving, goods transport" },
                { "General Labor", "👷", "Helper work, loading/unloading, misc tasks" },
                { "IT & Networking", "💻", "Computer repair, networking, CCTV installation" },
        };

        for (String[] c : cats) {
            JobCategory jc = new JobCategory();
            jc.setCategoryName(c[0]);
            jc.setCategoryIcon(c[1]);
            jc.setDescription(c[2]);
            jobCategoryRepository.save(jc);
        }
        log.info("✅ Seeded {} job categories", cats.length);
    }

    private void seedEquipmentCategories() {
        if (equipmentCategoryRepository.count() > 0)
            return;

        String[][] cats = {
                { "Power Tools", "🔌", "Drills, grinders, saws, sanders" },
                { "Hand Tools", "🔨", "Hammers, wrenches, screwdrivers" },
                { "Construction", "🏗", "Scaffolding, mixers, compactors" },
                { "Painting Equipment", "🎨", "Spray guns, rollers, ladders" },
                { "Plumbing Tools", "🔧", "Pipe cutters, wrenches, soldering kits" },
                { "Electrical Tools", "⚡", "Testers, wire strippers, crimping tools" },
                { "Garden Equipment", "🌿", "Mowers, trimmers, blowers" },
                { "Safety Equipment", "🦺", "Helmets, harnesses, gloves, boots" },
                { "Cleaning Equipment", "🧹", "Pressure washers, vacuum cleaners" },
                { "Heavy Machinery", "🚜", "Excavators, loaders, cranes" },
        };

        for (String[] c : cats) {
            EquipmentCategory ec = new EquipmentCategory();
            ec.setCategoryName(c[0]);
            ec.setCategoryIcon(c[1]);
            ec.setDescription(c[2]);
            equipmentCategoryRepository.save(ec);
        }
        log.info("✅ Seeded {} equipment categories", cats.length);
    }
}
