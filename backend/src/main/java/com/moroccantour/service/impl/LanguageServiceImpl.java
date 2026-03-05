package com.moroccantour.service.impl;

import com.moroccantour.dto.request.CreateLanguageRequest;
import com.moroccantour.dto.response.LanguageResponse;
import com.moroccantour.entity.Language;
import com.moroccantour.exception.BadRequestException;
import com.moroccantour.exception.ConflictException;
import com.moroccantour.exception.NotFoundException;
import com.moroccantour.mapper.LanguageMapper;
import com.moroccantour.repository.LanguageRepository;
import com.moroccantour.service.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LanguageServiceImpl implements LanguageService {

    private final LanguageRepository languageRepository;
    private final LanguageMapper languageMapper;

    @Override
    public List<LanguageResponse> findAll() {
        return languageRepository.findAll().stream()
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .map(languageMapper::toResponse)
                .toList();
    }

    @Override
    public LanguageResponse create(CreateLanguageRequest request) {
        String name = request.name().trim();
        if (name.isEmpty()) {
            throw new BadRequestException("Name is required");
        }
        if (languageRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Language already exists");
        }
        Language language = languageMapper.toEntity(new CreateLanguageRequest(name));
        languageRepository.save(language);
        return languageMapper.toResponse(language);
    }

    @Override
    public LanguageResponse update(Long id, CreateLanguageRequest request) {
        String name = request.name().trim();
        if (name.isEmpty()) {
            throw new BadRequestException("Name is required");
        }
        Language language = languageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Language not found"));

        languageRepository.findByNameIgnoreCase(name)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new ConflictException("Language already exists"); });

        languageMapper.updateEntity(new CreateLanguageRequest(name), language);
        languageRepository.save(language);
        return languageMapper.toResponse(language);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Language language = languageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Language not found"));

        language.getTours().forEach(t -> t.getLanguages().remove(language));
        language.getUsers().forEach(u -> u.getLanguages().remove(language));

        languageRepository.delete(language);
    }
}
