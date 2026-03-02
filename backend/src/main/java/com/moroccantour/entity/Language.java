package com.moroccantour.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "languages", uniqueConstraints = {
    @UniqueConstraint(name = "uk_language_name", columnNames = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Language {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Builder.Default
    @ManyToMany(mappedBy = "languages")
    private Set<Tour> tours = new HashSet<>();

    @Builder.Default
    @ManyToMany(mappedBy = "languages")
    private Set<User> users = new HashSet<>();
}
